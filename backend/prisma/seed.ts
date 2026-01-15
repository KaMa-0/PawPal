import { PrismaClient, UserType, AustriaState } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    const adminEmail = 'admin@pawpal.com';
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash,
            username: 'AdminUser',
            state: AustriaState.WIEN,
            userType: UserType.ADMIN,
            admin: {
                create: {}
            }
        },
    });
    console.log({ admin });

    // 2. Create Pet Owners
    const owners = [
        { email: 'owner1@test.com', username: 'Owner Anna', state: AustriaState.WIEN },
        { email: 'owner2@test.com', username: 'Owner Bob', state: AustriaState.SALZBURG },
    ];

    for (const o of owners) {
        const user = await prisma.user.upsert({
            where: { email: o.email },
            update: {},
            create: {
                email: o.email,
                passwordHash,
                username: o.username,
                state: o.state,
                userType: UserType.OWNER,
                petOwner: {
                    create: {
                        aboutText: `Hi, I am ${o.username}. I love my pets!`,
                        petTypes: ['DOG', 'CAT']
                    }
                },
                profileImages: {
                    create: {
                        imageUrl: '/uploads/default-avatar.png', // Placeholder
                        isAvatar: true
                    }
                }
            },
        });
        console.log(`Created Owner: ${user.username}`);
    }

    // 3. Create Pet Sitters
    const sitters = [
        { email: 'sitter1@test.com', username: 'Sitter Sarah', state: AustriaState.WIEN, rating: 4.5, pets: ['DOG'] },
        { email: 'sitter2@test.com', username: 'Sitter Mike', state: AustriaState.TIROL, rating: 5.0, pets: ['CAT', 'DOG'] },
        { email: 'sitter3@test.com', username: 'Sitter Lisa', state: AustriaState.WIEN, rating: 3.8, pets: ['FISH'] },
    ];

    for (const s of sitters) {
        const user = await prisma.user.upsert({
            where: { email: s.email },
            update: {},
            create: {
                email: s.email,
                passwordHash,
                username: s.username,
                state: s.state,
                userType: UserType.SITTER,
                petSitter: {
                    create: {
                        aboutText: `I am ${s.username}, an experienced pet sitter in ${s.state}.`,
                        averageRating: s.rating,
                        petTypes: s.pets,
                        // Create a dummy certification request for verified status check
                        certificationRequests: {
                            create: {
                                status: 'APPROVED'
                            }
                        }
                    }
                },
                profileImages: {
                    create: {
                        imageUrl: '/uploads/default-sitter.png',
                        isAvatar: true
                    }
                }
            },
        });
        console.log(`Created Sitter: ${user.username}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
