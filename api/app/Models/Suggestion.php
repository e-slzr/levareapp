<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Suggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'title',
        'artist',
        'notes',
        'url',
        'suggested_by',
        'status',
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

    public function suggestedBy()
    {
        return $this->belongsTo(User::class, 'suggested_by');
    }

    public function voters()
    {
        return $this->belongsToMany(User::class, 'suggestion_votes');
    }
}
