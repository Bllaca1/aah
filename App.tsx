



import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import MatchesPage from './pages/MatchesPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import MatchDetailsPage from './pages/MatchDetailsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDisputesPage from './pages/AdminDisputesPage';
import TeamPage from './pages/TeamPage';
import { AppContext } from './context/AppContext';
import { MOCK_MATCHES, ALL_MOCK_USERS, MOCK_NOTIFICATIONS, MOCK_CHANNELS, MOCK_MESSAGES, MOCK_TEAMS, GAMES } from './constants';
import type { User, Match, Notification, ChatChannel, ChatMessage, Team } from './types';
import { UserRole, MatchTeamSize, MatchStatus, NotificationType, ServerRegion } from './types';
import SearchPage from './pages/SearchPage';
import UserProfilePage from './pages/UserProfilePage';
import FriendsPage from './pages/FriendsPage';
import ChatWidget from './components/chat/ChatWidget';


function App() {
  const [user, setUser] = useState<User | null>(null); // Start logged out
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [allUsers, setAllUsers] = useState<User[]>(ALL_MOCK_USERS);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const updateMatch = useCallback((matchId: string, updates: Partial<Match>) => {
    setMatches(prevMatches =>
      prevMatches.map(m => m.id === matchId ? { ...m, ...updates } : m)
    );
  }, []);
  
  const updateUserById = useCallback((userId: string, updates: Partial<User>) => {
    setAllUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
          const newUpdates = { ...updates };
          if (newUpdates.rating !== undefined) {
              // Ensure rating is capped between 0 and 100
              newUpdates.rating = Math.max(0, Math.min(100, newUpdates.rating));
          }
          return { ...u, ...newUpdates };
        }
        return u;
      })
    );
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      updateUserById(user.id, updates);
    }
  }, [user, updateUserById]);

  const login = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    setNotifications(MOCK_NOTIFICATIONS);
    setChannels(MOCK_CHANNELS);
    setMessages(MOCK_MESSAGES);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);
  
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  }, []);

  const sendFriendRequest = useCallback((toUserId: string) => {
    if (!user) return;
    updateUser({
        friendRequests: {
            ...user.friendRequests,
            sent: [...user.friendRequests.sent, toUserId],
        }
    });
    // In a real app, this would also update the target user's received requests
  }, [user, updateUser]);

  const acceptFriendRequest = useCallback((requesterId: string) => {
      if (!user) return;
      const requester = allUsers.find(u => u.id === requesterId);
      if (!requester) return;

      // Update current user
      updateUser({
          friends: [...user.friends, requesterId],
          friendRequests: {
              ...user.friendRequests,
              received: user.friendRequests.received.filter(id => id !== requesterId),
          }
      });
      
      // Update requester
      updateUserById(requesterId, {
        friends: [...requester.friends, user.id],
        friendRequests: {
          ...requester.friendRequests,
          sent: requester.friendRequests.sent.filter(id => id !== user.id),
        }
      })
      
      // Add notification for the user who sent the request
  }, [user, allUsers, updateUser, updateUserById]);

  const rejectFriendRequest = useCallback((requesterId: string) => {
      if (!user) return;
      updateUser({
          friendRequests: {
              ...user.friendRequests,
              received: user.friendRequests.received.filter(id => id !== requesterId),
          }
      });
  }, [user, updateUser]);

  const removeFriend = useCallback((friendId: string) => {
      if (!user) return;
      const friend = allUsers.find(u => u.id === friendId);
      if(!friend) return;
      
      // Update current user
      updateUser({
          friends: user.friends.filter(id => id !== friendId),
      });

      // Update friend
      updateUserById(friendId, {
          friends: friend.friends.filter(id => id !== user.id),
      });

  }, [user, allUsers, updateUser, updateUserById]);

    const joinTeam = useCallback((matchId: string, team: 'A' | 'B') => {
        if (!user) return;

        const match = matches.find(m => m.id === matchId);
        if (!match) {
            alert("Match not found.");
            return;
        }

        if (user.credits < match.wager) {
        alert("You don't have enough credits to join this match.");
        return;
        }

        const teamKey = team === 'A' ? 'teamA' : 'teamB';
        const maxTeamSize = match.teamSize === MatchTeamSize.SOLO ? 1 : 5;

        if (match[teamKey].length >= maxTeamSize) {
            alert(`Team ${team} is already full.`);
            return;
        }
        
        if (match.teamA.includes(user.id) || match.teamB.includes(user.id)) {
            alert("You are already in this match.");
            return;
        }

        updateUser({ credits: user.credits - match.wager });

        const newTeamA = team === 'A' ? [...match.teamA, user.id] : match.teamA;
        const newTeamB = team === 'B' ? [...match.teamB, user.id] : match.teamB;
        
        const updates: Partial<Match> = {
            teamA: newTeamA,
            teamB: newTeamB,
            prizePool: match.prizePool + match.wager,
        };

        if (newTeamA.length === maxTeamSize && newTeamB.length === maxTeamSize) {
            updates.status = MatchStatus.IN_PROGRESS;
        }

        updateMatch(matchId, updates);
    }, [user, matches, updateUser, updateMatch]);

  const reportMatchResult = useCallback((matchId: string, winningTeam: 'A' | 'B') => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status !== MatchStatus.IN_PROGRESS) {
      console.error("Match cannot be settled.");
      return;
    }

    const winningTeamIds = winningTeam === 'A' ? match.teamA : match.teamB;
    if (winningTeamIds.length === 0) {
      console.error("Winning team has no players.");
      return;
    }

    const platformFee = 0.05;
    const totalWinnings = match.prizePool * (1 - platformFee);
    const winningsPerPlayer = totalWinnings / winningTeamIds.length;

    winningTeamIds.forEach(winnerId => {
      const winner = allUsers.find(u => u.id === winnerId);
      if (winner) {
          // If the winner is the current logged in user, use `updateUser` which handles both states.
          if (user && user.id === winnerId) {
              updateUser({ credits: winner.credits + winningsPerPlayer });
          } else {
              // Otherwise, just update the global list.
              updateUserById(winnerId, { credits: winner.credits + winningsPerPlayer });
          }
      }
    });
    
    // FIX: Correctly pass winningTeam to updateMatch. The `winnerTeam` property was used as a shorthand, but the variable in scope is `winningTeam`.
    updateMatch(matchId, { status: MatchStatus.COMPLETED, winnerTeam: winningTeam });

  }, [matches, allUsers, user, updateMatch, updateUserById, updateUser]);

  const disputeMatch = useCallback((matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status !== MatchStatus.IN_PROGRESS) {
      console.error("Match cannot be disputed.");
      return;
    }
    updateMatch(matchId, { status: MatchStatus.DISPUTED });
  }, [matches, updateMatch]);

  const sendMessage = useCallback((channelId: string, content: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: user.id,
      content,
      timestamp: new Date().toISOString(),
      readBy: [user.id],
    };

    setMessages(prev => [...prev, newMessage]);
    setChannels(prev => prev.map(c => 
      c.id === channelId ? { ...c, lastMessage: newMessage } : c
    ));

  }, [user]);

  const markMessagesAsRead = useCallback((channelId: string) => {
      if (!user) return;

      setMessages(prev => prev.map(msg => {
          if (msg.channelId === channelId && !msg.readBy.includes(user.id)) {
              return { ...msg, readBy: [...msg.readBy, user.id] };
          }
          return msg;
      }));
      
      setChannels(prevChannels => prevChannels.map(channel => {
          if (channel.id === channelId && channel.lastMessage && !channel.lastMessage.readBy.includes(user.id)) {
              return {
                  ...channel,
                  lastMessage: {
                      ...channel.lastMessage,
                      readBy: [...channel.lastMessage.readBy, user.id]
                  }
              };
          }
          return channel;
      }));
  }, [user]);

  const createTeam = useCallback((teamData: { name: string; tag: string; avatarUrl?: string }) => {
    if (!user) return;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamData.name,
      tag: teamData.tag,
      avatarUrl: teamData.avatarUrl || `https://api.dicebear.com/8.x/rings/svg?seed=${teamData.name}`,
      captainId: user.id,
      members: [user.id],
      elo: 1500, // Starting ELO
      wins: 0,
      losses: 0,
    };

    setTeams(prev => [...prev, newTeam]);
    updateUser({ teamId: newTeam.id });
  }, [user, updateUser]);

  const inviteToTeam = useCallback((teamId: string, friendIds: string[]) => {
      if (!user) return;
      const team = teams.find(t => t.id === teamId);
      if (!team) return;

      friendIds.forEach(friendId => {
        const friend = allUsers.find(u => u.id === friendId);
        if(friend && !friend.teamId && !friend.teamInvites.includes(teamId)) {
            updateUserById(friendId, {
                teamInvites: [...friend.teamInvites, teamId]
            });
            // In a real app, a notification would be created for the friend.
            console.log(`Invited ${friend.username} to ${team.name}`);
        }
      });
  }, [user, allUsers, teams, updateUserById]);

  const acceptTeamInvite = useCallback((teamId: string) => {
    if (!user || user.teamId) {
      alert(user?.teamId ? "You are already on a team." : "You must be logged in.");
      return;
    }
    
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      alert("Team not found.");
      return;
    }

    updateUser({
      teamId: teamId,
      teamInvites: user.teamInvites.filter(id => id !== teamId)
    });

    setTeams(prevTeams => prevTeams.map(t => 
      t.id === teamId ? { ...t, members: [...t.members, user.id] } : t
    ));

    markNotificationAsRead(`notif-team-invite-${teamId}`);
    markNotificationAsRead(`notif-team-invite-${teamId}-${user.id}`); // For mock constant

  }, [user, teams, updateUser, markNotificationAsRead]);

  const rejectTeamInvite = useCallback((teamId: string) => {
    if (!user) return;

    updateUser({
      teamInvites: user.teamInvites.filter(id => id !== teamId)
    });
     markNotificationAsRead(`notif-team-invite-${teamId}`);
     markNotificationAsRead(`notif-team-invite-${teamId}-${user.id}`);
  }, [user, updateUser, markNotificationAsRead]);

  const rateOpponents = useCallback((matchId: string) => {
    if (!user) return;

    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const opponentTeamIds = match.teamA.includes(user.id) ? match.teamB : match.teamA;

    setAllUsers(prevUsers => 
      prevUsers.map(u => {
        if (opponentTeamIds.includes(u.id)) {
          return { 
            ...u, 
            goodSportRating: (u.goodSportRating || 0) + 1,
            totalMatchesRated: (u.totalMatchesRated || 0) + 1,
          };
        }
        return u;
      })
    );

    updateMatch(matchId, {
      goodSportRatingsGiven: {
        ...(match.goodSportRatingsGiven || {}),
        [user.id]: true,
      }
    });
  }, [user, matches, updateMatch]);

    const createMatch = useCallback((newMatchData: Partial<Match>) => {
        if (!user) return;
        const game = GAMES.find(g => g.id === (newMatchData.game as any)?.id);
        if (!game) return;

        const newMatch: Match = {
            id: `match-${Date.now()}`,
            game,
            wager: newMatchData.wager || 0,
            teamSize: newMatchData.teamSize || MatchTeamSize.SOLO,
            // FIX: Use the ServerRegion enum member instead of a string literal to match the type definition.
            region: newMatchData.region || ServerRegion.NA_EAST,
            status: MatchStatus.OPEN,
            elo: user.elo,
            teamA: [user.id],
            teamB: [],
            prizePool: newMatchData.wager || 0,
            createdAt: new Date().toISOString(),
            teamAId: newMatchData.teamAId,
        };

        setMatches(prev => [newMatch, ...prev]);
    }, [user]);

    const kickMember = useCallback((teamId: string, memberId: string) => {
        if (!user) return;
        const team = teams.find(t => t.id === teamId);
        if (!team || team.captainId !== user.id || team.captainId === memberId) {
            alert("You don't have permission to do that, or you cannot kick the captain.");
            return;
        }

        setTeams(prev => prev.map(t => 
            t.id === teamId ? { ...t, members: t.members.filter(id => id !== memberId) } : t
        ));

        updateUserById(memberId, { teamId: null });
    }, [user, teams, updateUserById]);

    const leaveTeam = useCallback((teamId: string) => {
        if (!user) return;
        const team = teams.find(t => t.id === teamId);
        if (!team || team.captainId === user.id) {
            alert("You cannot leave the team as the captain. You must disband it.");
            return;
        }
        
        setTeams(prev => prev.map(t => 
            t.id === teamId ? { ...t, members: t.members.filter(id => id !== user.id) } : t
        ));

        updateUser({ teamId: null });
    }, [user, teams, updateUser]);

    const disbandTeam = useCallback((teamId: string) => {
        if (!user) return;
        const team = teams.find(t => t.id === teamId);
        if (!team || team.captainId !== user.id) {
            alert("You are not the captain of this team.");
            return;
        }

        team.members.forEach(memberId => {
            if (memberId === user.id) {
                updateUser({ teamId: null });
            } else {
                updateUserById(memberId, { teamId: null });
            }
        });

        setTeams(prev => prev.filter(t => t.id !== teamId));
    }, [user, teams, updateUser, updateUserById]);

  const contextValue = {
    user,
    allUsers,
    matches,
    notifications,
    teams,
    updateMatch,
    updateUser,
    updateUserById,
    login,
    logout,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    joinTeam,
    channels,
    messages,
    sendMessage,
    markMessagesAsRead,
    reportMatchResult,
    disputeMatch,
    createTeam,
    inviteToTeam,
    acceptTeamInvite,
    rejectTeamInvite,
    rateOpponents,
    createMatch,
    kickMember,
    leaveTeam,
    disbandTeam,
  };

  const AuthRoutes = () => (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );

  const AppRoutes = () => (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isMobileOpen={isMobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:matchId" element={<MatchDetailsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/users/:username" element={<UserProfilePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            {user?.role === UserRole.ADMIN && (
              <Route path="/admin/disputes" element={<AdminDisputesPage />} />
            )}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
      <ChatWidget />
    </div>
  );

  return (
    <AppContext.Provider value={contextValue}>
      {user ? <AppRoutes /> : <AuthRoutes />}
    </AppContext.Provider>
  );
}

export default App;
