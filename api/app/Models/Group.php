<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'invite_code',
        'created_by',
    ];

    /**
     * Get users belonging to the group.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'group_user')
                    ->withPivot('role');
    }

    /**
     * Get roles configurable for this group.
     */
    public function groupRoles()
    {
        return $this->hasMany(GroupRole::class);
    }

    /**
     * Get songs in group catalog.
     */
    public function songs()
    {
        return $this->hasMany(Song::class);
    }

    /**
     * Get setlists in group.
     */
    public function setlists()
    {
        return $this->hasMany(Setlist::class);
    }

    /**
     * Get events in group.
     */
    public function events()
    {
        return $this->hasMany(Event::class);
    }

    /**
     * Get suggestions in group.
     */
    public function suggestions()
    {
        return $this->hasMany(Suggestion::class);
    }

    /**
     * Get announcements in group.
     */
    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }
}
