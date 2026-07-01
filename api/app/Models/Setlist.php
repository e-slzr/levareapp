<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'name',
        'description',
        'date',
        'created_by',
    ];

    /**
     * Apply TenantScope for multi-tenant isolation.
     */
    protected static function booted()
    {
        static::addGlobalScope(new TenantScope);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function songs()
    {
        return $this->belongsToMany(Song::class, 'setlist_song')
                    ->withPivot('sort_order')
                    ->orderBy('setlist_song.sort_order', 'asc');
    }
}
