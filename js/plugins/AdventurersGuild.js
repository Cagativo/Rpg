const AdventurersGuild = {
    // Existing properties (rank, progress, etc.)
    rank: 'F',
    progress: 0,
    rankRequirements: {
        'F': { points: 0, nextRank: 'E' },
        'E': { points: 10, nextRank: 'D' },
        'D': { points: 25, nextRank: 'C' },
        'C': { points: 50, nextRank: 'B' },
        'B': { points: 100, nextRank: 'A' },
        'A': { points: 200, nextRank: 'S' },
        'S': { points: Infinity, nextRank: null } // S is the highest rank
    },

    // List of available quests
    quests: [
        { id: 1, name: 'Slay 5 Wolves', points: 5, rewardGold: 100 },
        { id: 2, name: 'Deliver a Package', points: 3, rewardGold: 50 },
        { id: 3, name: 'Defeat the Bandit Leader', points: 15, rewardGold: 300 }
    ],

    // === NEW: Quest Log Properties ===
    activeQuests: [], // Stores active quests
    completedQuests: [], // Stores completed quests

    // === Existing Methods ===
    // Complete a quest by ID
    completeQuest: function(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest) {
            this.progress += quest.points;
            $gameParty.gainGold(quest.rewardGold);
            this.checkRankUp();
            console.log(`Quest "${quest.name}" completed! Gained ${quest.points} points and ${quest.rewardGold} gold.`);
        } else {
            console.error(`Quest with ID ${questId} not found.`);
        }
    },

    // Check if the player can rank up
    checkRankUp: function() {
        const currentRankData = this.rankRequirements[this.rank];
        if (this.progress >= currentRankData.points && currentRankData.nextRank) {
            this.rank = currentRankData.nextRank;
            this.progress = 0; // Reset progress for the next rank
            console.log(`Congratulations! You are now rank ${this.rank}!`);
        }
    },

    // Display the player's current rank and progress
    displayStatus: function() {
        console.log(`Current Rank: ${this.rank}`);
        console.log(`Progress to next rank: ${this.progress}/${this.rankRequirements[this.rank].points}`);
    },

    // === NEW: Quest Log Methods ===
    // Accept a quest
    acceptQuest: function(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest && !this.activeQuests.includes(quest) && !this.completedQuests.includes(quest)) {
            this.activeQuests.push(quest);
            console.log(`Quest "${quest.name}" accepted!`);
        } else {
            console.error(`Quest with ID ${questId} not found or already accepted/completed.`);
        }
    },

    // Display the quest log
    displayQuestLog: function() {
        let message = "=== Active Quests ===\n";
        if (this.activeQuests.length > 0) {
            this.activeQuests.forEach(quest => {
                message += `${quest.name} - Reward: ${quest.rewardGold} gold, Points: ${quest.points}\n`;
            });
        } else {
            message += "No active quests.\n";
        }

        message += "\n=== Completed Quests ===\n";
        if (this.completedQuests.length > 0) {
            this.completedQuests.forEach(quest => {
                message += `${quest.name} - Reward: ${quest.rewardGold} gold, Points: ${quest.points}\n`;
            });
        } else {
            message += "No completed quests.\n";
        }

        $gameMessage.add(message);
    }
};