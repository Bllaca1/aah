import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAppContext } from '../hooks/useAppContext';
import { Shield, Crown, UserPlus, LogOut, Trash2, ShieldX } from 'lucide-react';
import type { Team, User, Match } from '../types';
import { MatchStatus } from '../types';
import PresenceIndicator from '../components/ui/PresenceIndicator';
import InviteFriendsModal from '../components/teams/InviteFriendsModal';
import Modal from '../components/ui/Modal';


const CreateTeamForm: React.FC = () => {
    const { createTeam } = useAppContext();
    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim() && tag.trim()) {
            createTeam({ name: name.trim(), tag: tag.trim().toUpperCase(), avatarUrl: avatarUrl.trim() });
        }
    };

    return (
        <Card>
            <div className="text-center">
                <Shield className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                <h1 className="text-3xl font-bold text-white">Create Your Team</h1>
                <p className="text-gray-400 mt-2">Assemble your squad and start competing together.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 max-w-sm mx-auto space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Team Name</label>
                    <input 
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={24}
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
                <div>
                    <label htmlFor="tag" className="block text-sm font-medium text-gray-400 mb-1">Team Tag (2-4 characters)</label>
                    <input
                        id="tag"
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value.toUpperCase())}
                        maxLength={4}
                        minLength={2}
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
                 <div>
                    <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-400 mb-1">Team Logo URL (Optional)</label>
                    <input
                        id="avatarUrl"
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
                <Button type="submit" className="w-full !mt-6">Create Team</Button>
            </form>
        </Card>
    );
};


const ViewTeam: React.FC<{ team: Team }> = ({ team }) => {
    const { user, allUsers, matches, kickMember, leaveTeam, disbandTeam } = useAppContext();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [confirmation, setConfirmation] = useState<{type: 'kick' | 'leave' | 'disband', member?: User} | null>(null);
    
    const members = team.members.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
    const isCaptain = user?.id === team.captainId;

    const teamMatches = matches.filter(m => m.teamAId === team.id || m.teamBId === team.id);

    const getMatchResult = (match: Match) => {
        if (match.status !== MatchStatus.COMPLETED) return match.status;
        if (!match.winnerTeam) return 'Draw';
        const isTeamAWinner = match.winnerTeam === 'A';
        return (isTeamAWinner && match.teamAId === team.id) || (!isTeamAWinner && match.teamBId === team.id) ? 'Win' : 'Loss';
    };

    const handleConfirm = () => {
        if (!confirmation) return;
        switch(confirmation.type) {
            case 'kick':
                if (confirmation.member) kickMember(team.id, confirmation.member.id);
                break;
            case 'leave':
                leaveTeam(team.id);
                break;
            case 'disband':
                disbandTeam(team.id);
                break;
        }
        setConfirmation(null);
    };

    return (
        <>
            <div className="space-y-8">
                <Card className="!p-0 overflow-hidden">
                     <div className="bg-gray-700 h-32" style={{backgroundImage: `url(https://picsum.photos/seed/${team.id}/1200/300)`, backgroundSize: 'cover'}}></div>
                     <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-end -mt-16">
                            <img src={team.avatarUrl} alt={team.name} className="w-24 h-24 rounded-full border-4 border-gray-800 bg-gray-900" />
                            <div className="ml-0 sm:ml-4 mt-4 sm:mt-0 flex-grow flex justify-between items-end">
                                <div>
                                    <h1 className="text-2xl font-bold text-white flex items-center">
                                        {team.name} <span className="ml-3 text-lg font-mono bg-gray-700 text-brand-primary px-2 py-0.5 rounded">{team.tag}</span>
                                    </h1>
                                </div>
                                {isCaptain && (
                                     <Button variant="primary" onClick={() => setInviteModalOpen(true)}>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Invite Friends
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-white">{team.elo}</p>
                                <p className="text-sm text-gray-400">Team ELO</p>
                            </div>
                            <div>
                                 <p className="text-2xl font-bold text-white">{team.wins}W - {team.losses}L</p>
                                <p className="text-sm text-gray-400">Record</p>
                            </div>
                             <div>
                                <p className="text-2xl font-bold text-white">{members.length}</p>
                                <p className="text-sm text-gray-400">Members</p>
                            </div>
                        </div>
                     </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Team Roster</h2>
                    <div className="space-y-3">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                <Link to={member.id === user?.id ? `/profile` : `/users/${member.username}`} className="flex items-center space-x-4 group">
                                    <div className="relative flex-shrink-0">
                                        <img src={member.avatarUrl} alt={member.username} className="w-12 h-12 rounded-full border-2 border-gray-600 group-hover:border-brand-primary transition-colors"/>
                                        <div className="absolute bottom-0 right-0">
                                            <PresenceIndicator status={member.status} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white group-hover:underline">{member.username}</p>
                                        <p className="text-sm text-gray-400">ELO: {member.elo}</p>
                                    </div>
                                </Link>
                                <div className="flex items-center space-x-4">
                                     {member.id === team.captainId && (
                                        <span className="flex items-center text-xs font-semibold text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">
                                            <Crown className="h-4 w-4 mr-1.5" /> Captain
                                        </span>
                                     )}
                                     {isCaptain && member.id !== user?.id && (
                                        <Button variant="danger" className="!px-2 !py-1" title="Kick Member" onClick={() => setConfirmation({type: 'kick', member})}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                     )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Team Match History</h2>
                    {teamMatches.length > 0 ? (
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-700 text-sm text-gray-400">
                                        <th className="py-2 px-4">Game</th>
                                        <th className="py-2 px-4">Result</th>
                                        <th className="py-2 px-4">Wager</th>
                                        <th className="py-2 px-4">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamMatches.map(match => {
                                        const result = getMatchResult(match);
                                        const resultColor = result === 'Win' ? 'text-green-400' : result === 'Loss' ? 'text-red-400' : 'text-yellow-400';
                                        return (
                                            <tr key={match.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                                 <td className="py-3 px-4 flex items-center">{match.game.name}</td>
                                                 <td className={`py-3 px-4 font-semibold ${resultColor}`}>{result}</td>
                                                 <td className="py-3 px-4">{match.wager} C</td>
                                                 <td className="py-3 px-4">{match.teamSize}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                         </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">This team has not played any official matches yet.</p>
                    )}
                </Card>
                
                 <Card className="border-red-500/30">
                    <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
                     {isCaptain ? (
                        <div>
                             <p className="text-sm text-gray-400 mb-4">Disbanding the team is permanent and will remove all members.</p>
                             <Button variant="danger" onClick={() => setConfirmation({type: 'disband'})}>
                                <ShieldX className="h-4 w-4 mr-2" />
                                Disband Team
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-400 mb-4">You will need another invite to rejoin the team after leaving.</p>
                            <Button variant="danger" onClick={() => setConfirmation({type: 'leave'})}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Leave Team
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
            {isCaptain && (
                <InviteFriendsModal 
                    isOpen={isInviteModalOpen}
                    onClose={() => setInviteModalOpen(false)}
                    team={team}
                />
            )}
            <Modal
                isOpen={!!confirmation}
                onClose={() => setConfirmation(null)}
                title={
                    confirmation?.type === 'kick' ? `Kick ${confirmation.member?.username}?` :
                    confirmation?.type === 'leave' ? 'Leave Team?' : 'Disband Team?'
                }
                footer={<>
                    <Button variant="secondary" onClick={() => setConfirmation(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirm}>Confirm</Button>
                </>}
            >
                <p className="text-gray-300">
                    {
                        confirmation?.type === 'kick' ? `Are you sure you want to remove ${confirmation.member?.username} from the team?` :
                        confirmation?.type === 'leave' ? 'Are you sure you want to leave the team?' : 'Are you sure you want to disband the team? This action cannot be undone.'
                    }
                </p>
            </Modal>
        </>
    );
}

function TeamPage() {
    const { user, teams } = useAppContext();
    
    if (!user) return null; // Or a loading spinner

    const myTeam = teams.find(t => t.id === user.teamId);

    if (myTeam) {
        return <ViewTeam team={myTeam} />;
    }

    // If user has invites, show them before create form
    if (user.teamInvites.length > 0) {
        // A simple prompt to check notifications, since they handle the logic
        return (
            <Card className="text-center">
                 <Shield className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                <h1 className="text-3xl font-bold text-white">You have pending team invites!</h1>
                <p className="text-gray-400 mt-2">Check your notifications to accept or decline.</p>
            </Card>
        )
    }

    return <CreateTeamForm />;
}

export default TeamPage;