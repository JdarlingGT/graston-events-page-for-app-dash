import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const TeamManagement: React.FC = () => {
  const [email, setEmail] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  const handleInvite = async () => {
    try {
      // Simulate inviting a team member
      setTeamMembers([...teamMembers, email]);
      setEmail('');
      toast.success(`Invited ${email} to the team!`);
    } catch (error) {
      toast.error('Failed to invite team member.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="email"
              placeholder="Enter team member's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleInvite}>Invite</Button>
          </div>
          <div>
            <h3 className="text-lg font-medium">Team Members</h3>
            <ul className="mt-2">
              {teamMembers.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamManagement;