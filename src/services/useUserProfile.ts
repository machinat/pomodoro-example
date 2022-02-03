import {
  makeFactoryProvider,
  StateController,
  BasicProfiler,
  MachinatProfile,
} from '@machinat/core';
import { STATE_KEY_PROFILE } from '../constant';
import { AppUser } from '../types';

const useUserProfile =
  (profiler: BasicProfiler, controller: StateController) =>
  async (user: AppUser): Promise<null | MachinatProfile> => {
    const userState = controller.userState(user);
    const cachedProfile = await userState.get<MachinatProfile>(
      STATE_KEY_PROFILE
    );
    if (cachedProfile) {
      return cachedProfile;
    }

    const profile = await profiler.getUserProfile(user);
    if (profile) {
      await userState.set<MachinatProfile>(STATE_KEY_PROFILE, profile);
    }

    return profile;
  };

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [BasicProfiler, StateController],
})(useUserProfile);
