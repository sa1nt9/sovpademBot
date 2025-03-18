import { prisma } from "../../db/postgres";

export async function getMe(id: string) {
    return await prisma.user.findUnique({
        where: { id: id },
    });
}
