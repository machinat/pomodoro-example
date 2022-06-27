import {
  makeFactoryProvider,
  StateController,
  BasicProfiler,
  SociablyProfile,
} from '@sociably/core';
import { STATE_KEY_PROFILE } from '../constant';
import { AppUser } from '../types';

const useUserProfile =
  (profiler: BasicProfiler, controller: StateController) =>
  async (user: AppUser): Promise<null | SociablyProfile> => {
    const userState = controller.userState(user);
    const cachedProfile = await userState.get<SociablyProfile>(
      STATE_KEY_PROFILE
    );
    if (cachedProfile) {
      return cachedProfile;
    }

    const profile = await profiler.getUserProfile(user);
    if (profile) {
      await userState.set<SociablyProfile>(STATE_KEY_PROFILE, profile);
    }

    return profile;
  };

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [BasicProfiler, StateController],
})(useUserProfile);
