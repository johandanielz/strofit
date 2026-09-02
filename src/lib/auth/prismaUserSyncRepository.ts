import { prisma } from '../db';
import { UserSyncRepository, SyncedUser } from './syncUser';

export const prismaUserSyncRepository: UserSyncRepository = {
  async findBySupabaseId(supabaseUserId) {
    const user = await prisma.user.findUnique({ where: { supabaseUserId } });
    return user;
  },

  async create(data) {
    const user = await prisma.user.create({ data });
    return user;
  },

  async updateEmail(id, email) {
    const user = await prisma.user.update({ where: { id }, data: { email } });
    return user;
  },
};