<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'name',
        'type',
        'date',
        'time',
        'description',
        'setlist_id',
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

    public function setlist()
    {
        return $this->belongsTo(Setlist::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function musicians()
    {
        return $this->belongsToMany(User::class, 'event_musicians')
                    ->withPivot('role');
    }
}
