import { UserProfile, SubscriptionTier, UpgradeTask } from '../types';
import { storageService } from './storageService';

const TRIAL_DURATION_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

export const upgradeService = {
  checkTrialStatus: async (user: UserProfile, username: string): Promise<UserProfile> => {
    if (user.subscriptionTier === SubscriptionTier.PRO_TRIAL && user.trialStartDate) {
      const now = Date.now();
      if (now - user.trialStartDate > TRIAL_DURATION_MS) {
        // Trial Expired
        const updatedUser = {
          ...user,
          subscriptionTier: SubscriptionTier.LIGHT,
          trialStartDate: undefined
        };
        await storageService.setData(`architect_data_${username}`, { user: updatedUser });
        return updatedUser;
      }
    }
    return user;
  },

  activateTrial: async (user: UserProfile, username: string): Promise<UserProfile> => {
    const updatedUser: UserProfile = {
      ...user,
      subscriptionTier: SubscriptionTier.PRO_TRIAL,
      trialStartDate: Date.now()
    };
    await storageService.setData(`architect_data_${username}`, { user: updatedUser });
    return updatedUser;
  },

  updateTaskProgress: async (user: UserProfile, username: string, type: UpgradeTask['type'], increment: number = 1): Promise<UserProfile> => {
    if (user.subscriptionTier === SubscriptionTier.PRO_LIFETIME) return user;

    const updatedTasks = user.upgradeTasks.map(task => {
      if (task.type === type && !task.completed) {
        const newCount = Math.min(task.currentCount + increment, task.targetCount);
        return {
          ...task,
          currentCount: newCount,
          completed: newCount >= task.targetCount
        };
      }
      return task;
    });

    const allCompleted = updatedTasks.every(t => t.completed);
    let newTier: SubscriptionTier = user.subscriptionTier;
    
    if (allCompleted) {
      newTier = SubscriptionTier.PRO_LIFETIME;
    }

    const updatedUser = {
      ...user,
      upgradeTasks: updatedTasks,
      subscriptionTier: newTier
    };

    await storageService.setData(`architect_data_${username}`, { user: updatedUser });
    return updatedUser;
  }
};
