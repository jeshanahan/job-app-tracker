import { prisma } from "@/lib/db";

export async function getOwnedApplication(applicationId: string, userId: string) {
  return prisma.jobApplication.findFirst({
    where: { id: applicationId, userId },
  });
}
