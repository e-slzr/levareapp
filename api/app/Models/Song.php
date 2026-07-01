<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Song extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'title',
        'artist',
        'key',
        'content',
        'url',
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

    public function setlists()
    {
        return $this->belongsToMany(Setlist::class, 'setlist_song')
                    ->withPivot('sort_order');
    }
}
