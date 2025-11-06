import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import type { User, Match, Notification, ChatChannel, ChatMessage, Team, DisputeEvidence } from './types';
import { UserRole, MatchTeamSize, MatchStatus, NotificationType, ServerRegion, ChannelType } from './types';
import SearchPage from './pages/SearchPage';
import UserProfilePage from './pages/UserProfilePage';
import FriendsPage from './pages/FriendsPage';
import ChatWidget from './components/chat/ChatWidget';
import { useAppContext } from './hooks/useAppContext';
import { ThemeProvider } from './context/ThemeContext';
import LobbyPage from './pages/LobbyPage';
import GameSelectionModal from './components/onboarding/GameSelectionModal';


const AuthLayout = () => (
  <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  </div>
);

const AppLayout = () => {
  const { user } = useAppContext();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar isMobileOpen={isMobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:matchId" element={<MatchDetailsPage />} />
            <Route path="/lobby/:matchId" element={<LobbyPage />} />
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
};


function App() {
  const [user, setUser] = useState<User | null>(null); // Start logged out
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [allUsers, setAllUsers] = useState<User[]>(ALL_MOCK_USERS);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGameSelectionModalOpen, setGameSelectionModalOpen] = useState(false);

  const isInteractionLocked = useMemo(() => {
    if (!user) return false;
     if (user.isMatchmakingLocked) return true;

    return matches.some(match =>
        (match.status === MatchStatus.IN_PROGRESS || match.status === MatchStatus.DISPUTED || match.status === MatchStatus.AWAITING_ADMIN_REVIEW) &&
        (match.teamA.includes(user.id) || match.teamB.includes(user.id))
    );
  }, [user, matches]);

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

    const resolveMatchAndUnlockPlayers = useCallback((matchId: string, updates: Partial<Match>) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        updateMatch(matchId, updates);
        
        const playersToUnlock = [...match.teamA, ...match.teamB];
        playersToUnlock.forEach(playerId => {
            updateUserById(playerId, { isMatchmakingLocked: false });
            if (user && user.id === playerId) {
                updateUser({ isMatchmakingLocked: false });
            }
        });
    }, [matches, updateMatch, updateUserById, user, updateUser]);


  const login = useCallback((loggedInUser: User) => {
    // For mock purposes: if user is new (from signup), add them to the list.
    setAllUsers(prevUsers => {
        const userExists = prevUsers.some(u => u.id === loggedInUser.id);
        if (userExists) {
            return prevUsers.map(u => u.id === loggedInUser.id ? loggedInUser : u);
        }
        return [...prevUsers, loggedInUser];
    });

    setUser(loggedInUser);
    setNotifications(MOCK_NOTIFICATIONS);
    setChannels(MOCK_CHANNELS);
    setMessages(MOCK_MESSAGES);

    if (!loggedInUser.hasCompletedOnboarding) {
      setGameSelectionModalOpen(true);
    }
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
        
        if (isInteractionLocked) {
            alert("You are in an active match or dispute. Please complete it before joining another.");
            return;
        }

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

        if (match.privacy === 'public' && newTeamA.length === maxTeamSize && newTeamB.length === maxTeamSize) {
            updates.status = MatchStatus.IN_PROGRESS;
        }

        updateMatch(matchId, updates);
        
        setChannels(prev => prev.map(c => 
            c.id === matchId && !c.participantIds.includes(user.id)
            ? { ...c, participantIds: [...c.participantIds, user.id] } 
            : c
        ));
    }, [user, matches, updateUser, updateMatch, isInteractionLocked]);

  const reportMatchResult = useCallback((matchId: string, winningTeam: 'A' | 'B') => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    if (match.status === MatchStatus.COMPLETED) {
      console.error("Match already completed.");
      return;
    }

    const winningTeamIds = winningTeam === 'A' ? match.teamA : match.teamB;
    const losingTeamIds = winningTeam === 'A' ? match.teamB : match.teamA;

    // --- ELO Calculation ---
    const K_FACTOR = 32;
    const gameId = match.game.id;
    
    const getAvgElo = (playerIds: string[]) => {
      if (playerIds.length === 0) return 1500; // Default ELO
      const totalElo = playerIds.reduce((sum, pId) => {
        const player = allUsers.find(u => u.id === pId);
        return sum + (player?.elo[gameId] || 1500);
      }, 0);
      return totalElo / playerIds.length;
    };
    
    const avgEloWinner = getAvgElo(winningTeamIds);
    const avgEloLoser = getAvgElo(losingTeamIds);

    const expectedWinner = 1 / (1 + 10 ** ((avgEloLoser - avgEloWinner) / 400));
    const expectedLoser = 1 - expectedWinner;

    const eloChangeWinner = K_FACTOR * (1 - expectedWinner);
    const eloChangeLoser = K_FACTOR * (0 - expectedLoser);

    // Update player ELOs
    [...winningTeamIds, ...losingTeamIds].forEach(pId => {
      const player = allUsers.find(u => u.id === pId);
      if (player) {
        const eloChange = winningTeamIds.includes(pId) ? eloChangeWinner : eloChangeLoser;
        const currentElo = player.elo[gameId] || 1500;
        const newElo = Math.round(currentElo + eloChange);
        updateUserById(pId, {
          elo: { ...player.elo, [gameId]: newElo }
        });
      }
    });

    // Update team ELOs if applicable
    const winningTeamData = teams.find(t => winningTeam === 'A' ? t.id === match.teamAId : t.id === match.teamBId);
    const losingTeamData = teams.find(t => winningTeam === 'A' ? t.id === match.teamBId : t.id === match.teamAId);
    
    if (winningTeamData) {
        const currentElo = winningTeamData.elo[gameId] || 1500;
        const newElo = Math.round(currentElo + eloChangeWinner);
        setTeams(prev => prev.map(t => t.id === winningTeamData.id ? { ...t, wins: t.wins + 1, elo: {...t.elo, [gameId]: newElo} } : t));
    }
     if (losingTeamData) {
        const currentElo = losingTeamData.elo[gameId] || 1500;
        const newElo = Math.round(currentElo + eloChangeLoser);
        setTeams(prev => prev.map(t => t.id === losingTeamData.id ? { ...t, losses: t.losses + 1, elo: {...t.elo, [gameId]: newElo} } : t));
    }


    // --- Credit Distribution ---
    if (winningTeamIds.length === 0) {
      console.error("Winning team has no players.");
      resolveMatchAndUnlockPlayers(matchId, { status: MatchStatus.REFUNDED, winnerTeam: null });
      return;
    }

    const platformFee = 0.05;
    const totalWinnings = match.prizePool * (1 - platformFee);
    const winningsPerPlayer = totalWinnings / winningTeamIds.length;

    winningTeamIds.forEach(winnerId => {
      const winner = allUsers.find(u => u.id === winnerId);
      if (winner) {
          updateUserById(winnerId, { credits: winner.credits + winningsPerPlayer });
          if (user && user.id === winnerId) {
             setUser(prev => prev ? ({ ...prev, credits: prev.credits + winningsPerPlayer }) : null);
          }
      }
    });
    
    resolveMatchAndUnlockPlayers(matchId, { status: MatchStatus.COMPLETED, winnerTeam: winningTeam });

  }, [matches, allUsers, user, teams, resolveMatchAndUnlockPlayers, updateUserById]);

  const disputeMatch = useCallback((matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status !== MatchStatus.IN_PROGRESS) {
      console.error("Match cannot be disputed.");
      return;
    }

    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h deadline

    updateMatch(matchId, { 
        status: MatchStatus.DISPUTED,
        disputeDetails: {
            deadline,
            playerEvidence: {}
        }
    });

    const playersToLock = [...match.teamA, ...match.teamB];
    playersToLock.forEach(playerId => {
        updateUserById(playerId, { isMatchmakingLocked: true });
    });
    
    if (user && playersToLock.includes(user.id)) {
        updateUser({ isMatchmakingLocked: true });
    }
  }, [matches, updateMatch, user, updateUser, updateUserById]);

  const submitDisputeEvidence = useCallback((matchId: string, evidence: Omit<DisputeEvidence, 'submittedAt'>) => {
    if (!user) return;
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(evidence.youtubeLink)) {
        alert("Please provide a valid YouTube link.");
        return;
    }

    const match = matches.find(m => m.id === matchId);
    if (!match || !match.disputeDetails) return;

    // Unlock the submitting player
    updateUser({ isMatchmakingLocked: false });
    updateUserById(user.id, { isMatchmakingLocked: false });

    const newPlayerEvidence = {
        ...match.disputeDetails.playerEvidence,
        [user.id]: {
            ...evidence,
            submittedAt: new Date().toISOString(),
        }
    };
    
    const allPlayers = [...match.teamA, ...match.teamB];
    const opponentIds = allPlayers.filter(pId => !match.teamA.includes(user.id) ? match.teamA.includes(pId) : match.teamB.includes(pId));
    const opponentHasSubmitted = opponentIds.some(id => newPlayerEvidence[id]);

    let newStatus = match.status;
    let newDeadline = match.disputeDetails.deadline;

    if (opponentHasSubmitted) {
        newStatus = MatchStatus.AWAITING_ADMIN_REVIEW;
    } else {
        newStatus = MatchStatus.AWAITING_OPPONENT_EVIDENCE;
        newDeadline = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
    }

    updateMatch(matchId, {
        status: newStatus,
        disputeDetails: {
            ...match.disputeDetails,
            deadline: newDeadline,
            playerEvidence: newPlayerEvidence,
        }
    });
  }, [user, matches, updateMatch, updateUser, updateUserById]);

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

      setMessages(prevMessages => {
          let hasChanged = false;
          const newMessages = prevMessages.map(msg => {
              if (msg.channelId === channelId && !msg.readBy.includes(user.id)) {
                  hasChanged = true;
                  return { ...msg, readBy: [...msg.readBy, user.id] };
              }
              return msg;
          });
          return hasChanged ? newMessages : prevMessages;
      });
      
      setChannels(prevChannels => {
          let hasChanged = false;
          const newChannels = prevChannels.map(channel => {
              if (channel.id === channelId && channel.lastMessage && !channel.lastMessage.readBy.includes(user.id)) {
                  hasChanged = true;
                  return {
                      ...channel,
                      lastMessage: {
                          ...channel.lastMessage,
                          readBy: [...channel.lastMessage.readBy, user.id]
                      }
                  };
              }
              return channel;
          });
          return hasChanged ? newChannels : prevChannels;
      });
  }, [user]);

  const createTeam = useCallback(() => {
    if (!user) return;
    
    const initialElo = GAMES.reduce((acc, game) => {
        acc[game.id] = 1500;
        return acc;
    }, {} as { [gameId: string]: number });

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: `${user.username}'s Party`,
      tag: 'PARTY',
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`,
      captainId: user.id,
      members: [user.id],
      elo: initialElo,
      wins: 0,
      losses: 0,
    };

    setTeams(prev => [...prev, newTeam]);
    updateUser({ teamId: newTeam.id });

    const newChannel: ChatChannel = {
        id: newTeam.id,
        type: ChannelType.TEAM,
        participantIds: [user.id],
    };
    setChannels(prev => [...prev, newChannel]);

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

    setChannels(prev => prev.map(c => 
        c.id === teamId && !c.participantIds.includes(user.id)
        ? { ...c, participantIds: [...c.participantIds, user.id] } 
        : c
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

    const createMatch = useCallback((newMatchData: Partial<Match>): Match | null => {
        if (!user) return null;

        if (isInteractionLocked) {
            alert("You are in an active match or dispute. Please complete it before creating a new one.");
            return null;
        }

        const game = GAMES.find(g => g.id === (newMatchData.game as any)?.id);
        if (!game) return null;

        const newMatch: Match = {
            id: `match-${Date.now()}`,
            game,
            wager: newMatchData.wager || 0,
            teamSize: newMatchData.teamSize || MatchTeamSize.SOLO,
            region: newMatchData.region || ServerRegion.NA_EAST,
            status: newMatchData.privacy === 'private' ? MatchStatus.LOBBY : MatchStatus.OPEN,
            elo: user.elo[game.id] || 1500,
            teamA: [user.id],
            teamB: [],
            prizePool: newMatchData.wager || 0,
            createdAt: new Date().toISOString(),
            teamAId: newMatchData.teamAId,
            privacy: newMatchData.privacy || 'public',
            inviteCode: newMatchData.privacy === 'private' ? Math.random().toString(36).substring(2, 7).toUpperCase() : undefined,
            readyPlayers: newMatchData.privacy === 'private' ? [user.id] : [],
        };

        setMatches(prev => [newMatch, ...prev]);

        const newChannel: ChatChannel = {
            id: newMatch.id,
            type: ChannelType.MATCH,
            participantIds: [user.id],
        };
        setChannels(prev => [...prev, newChannel]);
        return newMatch;
    }, [user, isInteractionLocked]);

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

        setChannels(prev => prev.map(c => 
            c.id === teamId ? { ...c, participantIds: c.participantIds.filter(id => id !== memberId) } : c
        ));
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

        setChannels(prev => prev.map(c => 
            c.id === teamId ? { ...c, participantIds: c.participantIds.filter(id => id !== user.id) } : c
        ));
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
        setChannels(prev => prev.filter(c => c.id !== teamId));
    }, [user, teams, updateUser, updateUserById]);

    const joinWithCode = useCallback((inviteCode: string): Match | null => {
      if (!user) return null;
      const match = matches.find(m => m.inviteCode === inviteCode && m.status === MatchStatus.LOBBY);
      if (!match) {
        alert("Invalid or expired invite code.");
        return null;
      }
      
      const maxTeamSize = match.teamSize === MatchTeamSize.SOLO ? 1 : 5;
      if (match.teamA.length + match.teamB.length >= maxTeamSize * 2) {
        alert("Lobby is full.");
        return null;
      }
      
      if (user.credits < match.wager) {
        alert("Insufficient funds.");
        return null;
      }
      
      const teamToJoin = match.teamA.length > match.teamB.length ? 'B' : 'A';
      joinTeam(match.id, teamToJoin);
      
      return matches.find(m => m.id === match.id) || match; // Return updated match
    }, [user, matches, joinTeam]);

    const inviteToLobby = useCallback((matchId: string, inviteeId: string) => {
      if (!user) return;
      const invitee = allUsers.find(u => u.id === inviteeId);
      if (!invitee) return;

      const newNotification: Notification = {
        id: `notif-lobby-${matchId}-${inviteeId}`,
        type: NotificationType.MATCH_LOBBY_INVITE,
        message: 'has invited you to a private match!',
        timestamp: new Date().toISOString(),
        read: false,
        sender: user,
        linkTo: `/lobby/${matchId}`,
      };
      setNotifications(prev => [newNotification, ...prev]);
    }, [user, allUsers]);

    const readyUp = useCallback((matchId: string) => {
      if (!user) return;
      updateMatch(matchId, {
        readyPlayers: [...(matches.find(m => m.id === matchId)?.readyPlayers || []), user.id]
      });
    }, [user, matches, updateMatch]);

    const startPrivateMatch = useCallback((matchId: string) => {
      if (!user) return;
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      const totalPlayers = match.teamA.length + match.teamB.length;
      const requiredPlayers = (match.teamSize === MatchTeamSize.SOLO ? 1 : 5) * 2;
      
      if (totalPlayers !== requiredPlayers || match.readyPlayers.length !== requiredPlayers) {
        alert("Cannot start match: Lobby is not full or not all players are ready.");
        return;
      }
      
      updateMatch(matchId, { status: MatchStatus.IN_PROGRESS });
    }, [user, matches, updateMatch]);

    const handleCompleteOnboarding = useCallback((selectedGameIds: string[]) => {
      updateUser({
        primaryGames: selectedGameIds,
        hasCompletedOnboarding: true,
      });
      setGameSelectionModalOpen(false);
    }, [updateUser]);
    
    useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        matches.forEach(match => {
            if ((match.status === MatchStatus.DISPUTED || match.status === MatchStatus.AWAITING_OPPONENT_EVIDENCE) && match.disputeDetails && new Date(match.disputeDetails.deadline) < now) {
                console.log(`Dispute deadline passed for match ${match.id}`);
                const evidence = match.disputeDetails.playerEvidence;
                const teamAPlayers = match.teamA;
                const teamBPlayers = match.teamB;

                const teamASubmitted = teamAPlayers.some(id => evidence[id]);
                const teamBSubmitted = teamBPlayers.some(id => evidence[id]);
                
                if (teamASubmitted && !teamBSubmitted) {
                    reportMatchResult(match.id, 'A');
                } else if (!teamASubmitted && teamBSubmitted) {
                    reportMatchResult(match.id, 'B');
                } else { 
                    resolveMatchAndUnlockPlayers(match.id, { status: MatchStatus.REFUNDED, winnerTeam: null });
                }
            }
        });
    }, 5000); // Check every 5 seconds for demo purposes

    return () => clearInterval(interval);
  }, [matches, reportMatchResult, resolveMatchAndUnlockPlayers]);


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
    submitDisputeEvidence,
    createTeam,
    inviteToTeam,
    acceptTeamInvite,
    rejectTeamInvite,
    rateOpponents,
    createMatch,
    kickMember,
    leaveTeam,
    disbandTeam,
    isInteractionLocked,
    joinWithCode,
    inviteToLobby,
    readyUp,
    startPrivateMatch,
  };

  return (
    <ThemeProvider>
      <AppContext.Provider value={contextValue}>
        {user ? <AppLayout /> : <AuthLayout />}
        {isGameSelectionModalOpen && (
          <GameSelectionModal 
            isOpen={isGameSelectionModalOpen}
            onSave={handleCompleteOnboarding}
          />
        )}
      </AppContext.Provider>
    </ThemeProvider>
  );
}

export default App;