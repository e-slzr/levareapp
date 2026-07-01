<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Event;
use App\Models\Group;
use App\Models\GroupRole;
use App\Models\Setlist;
use App\Models\Song;
use App\Models\Suggestion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Users
        $admin = User::create([
            'name' => 'Admin',
            'lastname' => 'Desarrollador',
            'email' => 'admin@worshipapp.com',
            'username' => 'admin',
            'password' => Hash::make('adminpassword'),
            'account_type' => 'superadmin',
            'status' => 'active',
            'must_change_password' => false,
        ]);

        $carlos = User::create([
            'name' => 'Carlos',
            'lastname' => 'Mendoza',
            'email' => 'lider@worshipapp.com',
            'username' => 'carlos',
            'password' => Hash::make('password123'),
            'account_type' => 'leader',
            'status' => 'active',
            'must_change_password' => false,
        ]);

        $sofia = User::create([
            'name' => 'Sofía',
            'lastname' => 'Martínez',
            'email' => 'sofia@worshipapp.com',
            'username' => 'sofia',
            'password' => Hash::make('password123'),
            'account_type' => 'member',
            'status' => 'active',
            'must_change_password' => false,
        ]);

        $mateo = User::create([
            'name' => 'Mateo',
            'lastname' => 'Silva',
            'email' => 'mateo@worshipapp.com',
            'username' => 'mateosilva',
            'password' => Hash::make('password123'),
            'account_type' => 'member',
            'status' => 'active',
            'must_change_password' => true, // First login force reset
        ]);

        // 2. Create Groups
        $groupFuego = Group::create([
            'name' => 'Ministerio Fuego Vivo',
            'description' => 'Grupo de alabanza de jóvenes',
            'invite_code' => 'FUEGO123',
            'created_by' => $carlos->id,
        ]);

        $groupVida = Group::create([
            'name' => 'Alabanza Nueva Vida',
            'description' => 'Coro general de la congregación',
            'invite_code' => 'VIDA456',
            'created_by' => $admin->id, // Created by admin
        ]);

        // 3. Setup group relations & roles in group_user
        // Carlos is Leader in Fuego Vivo, and Keyboardist in Nueva Vida
        DB::table('group_user')->insert([
            ['user_id' => $carlos->id, 'group_id' => $groupFuego->id, 'role' => 'Líder'],
            ['user_id' => $carlos->id, 'group_id' => $groupVida->id, 'role' => 'Teclado'],
        ]);

        // Sofia is Vocals in Fuego Vivo
        DB::table('group_user')->insert([
            ['user_id' => $sofia->id, 'group_id' => $groupFuego->id, 'role' => 'Voz Principal'],
        ]);

        // Mateo is Drums in Fuego Vivo
        DB::table('group_user')->insert([
            ['user_id' => $mateo->id, 'group_id' => $groupFuego->id, 'role' => 'Batería'],
        ]);

        // 4. Default musical roles for Fuego Vivo
        $rolesFuego = ["Líder", "Voz Principal", "Coros", "Guitarra Acústica", "Guitarra Eléctrica", "Teclado", "Bajo", "Batería", "Sonido / Multimedia"];
        foreach ($rolesFuego as $r) {
            GroupRole::create(['group_id' => $groupFuego->id, 'name' => $r]);
        }

        // Default musical roles for Nueva Vida
        $rolesVida = ["Líder", "Teclado", "Violín", "Guitarra Clásica", "Coros Femeninos", "Coros Masculinos"];
        foreach ($rolesVida as $r) {
            GroupRole::create(['group_id' => $groupVida->id, 'name' => $r]);
        }

        // 5. Seed Songs for Fuego Vivo (We bypass GlobalScope by defining group_id explicitly in creation)
        $song1 = Song::create([
            'group_id' => $groupFuego->id,
            'title' => 'Cuan Grande es Él',
            'artist' => 'Hymn',
            'key' => 'G',
            'content' => "[G] Señor mi Dios al con[C]templar los cielos,\nel fir[G]mamento y las es[D]trellas mil.",
            'url' => 'https://www.youtube.com/watch?v=cuan_grande',
            'created_by' => $carlos->id,
        ]);

        $song2 = Song::create([
            'group_id' => $groupFuego->id,
            'title' => 'La Bondad de Dios',
            'artist' => 'Bethel Music',
            'key' => 'A',
            'content' => "[A] Te amo Dios, tu a[D]mor no me ha fa[A]llado,\ntodos mis [E]días en tus [D]manos he es[A]tado.",
            'url' => 'https://www.youtube.com/watch?v=bondad_dios',
            'created_by' => $carlos->id,
        ]);

        $song3 = Song::create([
            'group_id' => $groupFuego->id,
            'title' => 'Gracias Dios',
            'artist' => 'Gateway Worship',
            'key' => 'E',
            'content' => "[E] Gracias Dios por el [A]día de hoy,\nte [E]doy mi vida y mi [B]corazón.",
            'url' => 'https://www.youtube.com/watch?v=gracias_dios',
            'created_by' => $carlos->id,
        ]);

        $song4 = Song::create([
            'group_id' => $groupFuego->id,
            'title' => 'Solo en Ti',
            'artist' => 'Evan Craft',
            'key' => 'D',
            'content' => "[D] Solo en Ti hay espe[G]ranza y paz,\ntu a[D]mor Jesús nunca [A]fallará.",
            'url' => 'https://www.youtube.com/watch?v=solo_en_ti',
            'created_by' => $carlos->id,
        ]);

        // Seed Songs for Nueva Vida
        Song::create([
            'group_id' => $groupVida->id,
            'title' => 'Sublime Gracia',
            'artist' => 'John Newton',
            'key' => 'F',
            'content' => "[F] Sublime gracia [Bb] del Se[F]ñor,\nque a un peca[Dm]dor sal[C]vó.",
            'url' => 'https://www.youtube.com/watch?v=sublime_gracia',
            'created_by' => $admin->id,
        ]);

        // 6. Seed Setlists for Fuego Vivo
        $setlist = Setlist::create([
            'group_id' => $groupFuego->id,
            'name' => 'Repertorio del Domingo de Jóvenes',
            'description' => 'Servicio general de las 10:00 AM',
            'date' => date('Y-m-d', strtotime('next Sunday')),
            'created_by' => $carlos->id,
        ]);

        // Link songs to setlist
        $setlist->songs()->attach([
            $song1->id => ['sort_order' => 0],
            $song2->id => ['sort_order' => 1]
        ]);

        // 7. Seed Events for Fuego Vivo
        $eventCulto = Event::create([
            'group_id' => $groupFuego->id,
            'name' => 'Culto de Jóvenes',
            'type' => 'culto',
            'date' => date('Y-m-d', strtotime('next Sunday')),
            'time' => '10:00:00',
            'description' => 'Servicio juvenil especial de alabanza',
            'setlist_id' => $setlist->id,
            'created_by' => $carlos->id,
        ]);

        $eventEnsayo = Event::create([
            'group_id' => $groupFuego->id,
            'name' => 'Ensayo General',
            'type' => 'ensayo',
            'date' => date('Y-m-d', strtotime('next Thursday')),
            'time' => '18:30:00',
            'description' => 'Repaso de cantos nuevos del repertorio',
            'setlist_id' => $setlist->id,
            'created_by' => $carlos->id,
        ]);

        // Setup musicians roster for the event
        $eventCulto->musicians()->attach([
            $carlos->id => ['role' => 'Teclado'],
            $sofia->id => ['role' => 'Voz Principal'],
            $mateo->id => ['role' => 'Batería']
        ]);

        $eventEnsayo->musicians()->attach([
            $carlos->id => ['role' => 'Teclado'],
            $sofia->id => ['role' => 'Voz Principal'],
            $mateo->id => ['role' => 'Batería']
        ]);

        // 8. Seed Suggestions for Fuego Vivo
        $sug1 = Suggestion::create([
            'group_id' => $groupFuego->id,
            'title' => 'Milagroso',
            'artist' => 'Way Maker',
            'notes' => 'Sería genial cantarla en tono de G',
            'url' => 'https://www.youtube.com/watch?v=waymaker',
            'suggested_by' => $sofia->id,
            'status' => 'pendiente',
        ]);

        $sug2 = Suggestion::create([
            'group_id' => $groupFuego->id,
            'title' => 'Agnus Dei',
            'artist' => 'Marco Barrientos',
            'notes' => 'Canción clásica para ministrar',
            'url' => 'https://www.youtube.com/watch?v=agnusdei',
            'suggested_by' => $carlos->id,
            'status' => 'ensayo',
        ]);

        // Seed suggestion votes (Milagroso has 3 votes, Agnus Dei has 1 vote)
        $sug1->voters()->attach([$sofia->id, $carlos->id, $mateo->id]);
        $sug2->voters()->attach([$carlos->id]);

        // 9. Seed Announcements
        Announcement::create([
            'group_id' => $groupFuego->id,
            'text' => '¡Bienvenidos al panel de WorshipApp!',
            'type' => 'purple',
        ]);

        Announcement::create([
            'group_id' => $groupFuego->id,
            'text' => "Carlos Mendoza añadió una nueva canción: \"{$song2->title}\" de {$song2->artist}.",
            'type' => 'blue',
        ]);

        Announcement::create([
            'group_id' => $groupFuego->id,
            'text' => 'Se programó un ensayo general para el próximo jueves a las 6:30 PM.',
            'type' => 'green',
        ]);
    }
}
