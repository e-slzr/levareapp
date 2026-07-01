<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * User Login API
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string',
            'password' => 'required|string',
        ], [
            'login.required' => 'El correo electrónico o nombre de usuario es obligatorio.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $login = $request->input('login');
        
        // Find user by email or username
        $user = User::where('email', $login)
            ->orWhere('username', ltrim($login, '@'))
            ->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 401);
        }

        // Global status check (Super Admin suspension control)
        if ($user->status === 'blocked') {
            return response()->json([
                'message' => 'Tu cuenta ha sido bloqueada. Contacta al administrador.'
            ], 403);
        }

        // Generate Sanctum API token
        $token = $user->createToken('WorshipAppToken')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'username' => $user->username,
                'avatar' => ($user->avatar && $user->avatar !== '0' && $user->avatar !== 'null') ? asset('storage/' . $user->avatar) : null,
                'account_type' => $user->account_type,
                'accentColor' => $user->accent_color ?? 'purple',
                'must_change_password' => $user->must_change_password,
            ]
        ]);
    }

    /**
     * Leader Self Registration (Option C)
     */
    public function registerLeader(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'lastname.required' => 'El apellido es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe tener un formato válido.',
            'email.unique' => 'Este correo ya ha sido registrado, intenta nuevamente.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->input('name'),
            'lastname' => $request->input('lastname'),
            'email' => $request->input('email'),
            'username' => explode('@', $request->input('email'))[0],
            'password' => Hash::make($request->input('password')),
            'account_type' => 'leader',
            'status' => 'active', // Active immediately
            'must_change_password' => false,
        ]);

        // Auto login token
        $token = $user->createToken('WorshipAppToken')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'username' => $user->username,
                'avatar' => null,
                'account_type' => $user->account_type,
                'accentColor' => 'purple',
                'must_change_password' => false,
            ]
        ], 201);
    }

    /**
     * Mandatory first-time password reset
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6|confirmed',
        ], [
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $user->password = Hash::make($request->input('password'));
        $user->must_change_password = false;
        $user->save();

        return response()->json([
            'message' => 'Contraseña cambiada exitosamente.'
        ]);
    }

    /**
     * Retrieve current profile details
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'lastname' => $user->lastname,
            'email' => $user->email,
            'username' => $user->username,
            'avatar' => ($user->avatar && $user->avatar !== '0' && $user->avatar !== 'null') ? asset('storage/' . $user->avatar) : null,
            'account_type' => $user->account_type,
            'accentColor' => $user->accent_color ?? 'purple',
        ]);
    }

    /**
     * Update basic profile info
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        \Illuminate\Support\Facades\Log::info("updateProfile llamado por usuario: " . ($user ? $user->id : 'NULL') . ". Avatar actual antes de guardar cambios en el objeto: " . ($user ? $user->avatar : 'NULL'));

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'email' => [
                Rule::requiredIf($user->account_type !== 'member'),
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'accentColor' => 'nullable|string|in:purple,green,yellow,aqua,red,white',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->name = $request->input('name');
        $user->lastname = $request->input('lastname');
        $user->username = ltrim($request->input('username'), '@');
        
        if ($user->account_type !== 'member') {
            $user->email = $request->input('email');
        }
        
        if ($request->has('accentColor')) {
            $user->accent_color = $request->input('accentColor');
        }

        $user->save();
        \Illuminate\Support\Facades\Log::info("updateProfile completado. Avatar en modelo despues de guardar: " . $user->avatar);

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'username' => $user->username,
                'avatar' => ($user->avatar && $user->avatar !== '0' && $user->avatar !== 'null') ? asset('storage/' . $user->avatar) : null,
                'account_type' => $user->account_type,
                'accentColor' => $user->accent_color ?? 'purple',
            ]
        ]);
    }

    /**
     * Upload profile avatar image
     */
    public function uploadAvatar(Request $request)
    {
        $user = $request->user();
        \Illuminate\Support\Facades\Log::info("uploadAvatar llamado por usuario: " . ($user ? $user->id : 'NULL'));

        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB limit
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::info("Validacion de avatar fallo: " . json_encode($validator->errors()));
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($user->avatar) {
                \Illuminate\Support\Facades\Log::info("Borrando avatar viejo: " . $user->avatar);
                Storage::disk('public')->delete($user->avatar);
            }

            // Save new
            $path = $request->file('avatar')->store('avatars', 'public');
            \Illuminate\Support\Facades\Log::info("Avatar subido en path: " . $path);
            $user->avatar = $path;
            $user->save();
            \Illuminate\Support\Facades\Log::info("Usuario guardado en base de datos. Avatar en modelo: " . $user->avatar);

            return response()->json([
                'message' => 'Foto de perfil actualizada.',
                'avatar_url' => asset('storage/' . $path)
            ]);
        }

        \Illuminate\Support\Facades\Log::info("Peticion sin archivo avatar.");
        return response()->json(['message' => 'No se subió ninguna imagen.'], 400);
    }

    /**
     * Remove profile avatar image
     */
    public function removeAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->avatar = null;
            $user->save();
            return response()->json(['message' => 'Foto de perfil eliminada.']);
        }

        return response()->json(['message' => 'No tienes ninguna foto de perfil activa.'], 400);
    }

    /**
     * User Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    /**
     * Validate Invite Code (Public)
     */
    public function validateInviteCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'invite_code' => 'required|string|size:6',
        ], [
            'invite_code.required' => 'El código de invitación es obligatorio.',
            'invite_code.size' => 'El código de invitación debe tener 6 caracteres.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $code = $request->input('invite_code');
        $group = Group::where('invite_code', $code)->first();

        if (!$group) {
            return response()->json([
                'message' => 'El código de invitación ingresado es incorrecto.'
            ], 404);
        }

        return response()->json([
            'message' => 'Código de invitación válido.',
            'group_name' => $group->name,
            'invite_code' => $group->invite_code,
        ]);
    }

    /**
     * Register new member via Invite Code (Public)
     */
    public function registerMember(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'invite_code' => 'required|string|size:6',
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'lastname.required' => 'El apellido es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe tener un formato válido.',
            'email.unique' => 'Este correo ya ha sido registrado, intenta nuevamente.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'invite_code.required' => 'El código de invitación es obligatorio.',
            'invite_code.size' => 'El código de invitación debe tener 6 caracteres.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $code = $request->input('invite_code');
        $group = Group::where('invite_code', $code)->first();

        if (!$group) {
            return response()->json([
                'message' => 'El código de invitación ingresado es incorrecto.'
            ], 404);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->input('name'),
                'lastname' => $request->input('lastname'),
                'email' => $request->input('email'),
                'username' => explode('@', $request->input('email'))[0],
                'password' => Hash::make($request->input('password')),
                'account_type' => 'member',
                'status' => 'active', // Active immediately
                'must_change_password' => false,
            ]);

            // Associate user to group
            $group->users()->attach($user->id, ['role' => '']);

            DB::commit();

            // Auto login token
            $token = $user->createToken('WorshipAppToken')->plainTextToken;

            return response()->json([
                'message' => 'Registro completado correctamente.',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'lastname' => $user->lastname,
                    'email' => $user->email,
                    'username' => $user->username,
                    'avatar' => null,
                    'account_type' => $user->account_type,
                    'accentColor' => 'purple',
                    'must_change_password' => false,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar integrante.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
