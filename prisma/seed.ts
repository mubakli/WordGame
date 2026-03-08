import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialVocabulary = [
  { english: 'Substantial', turkish: 'Önemli, büyük, kayda değer' },
  { english: 'Inevitable', turkish: 'Kaçınılmaz' },
  { english: 'Crucial', turkish: 'Çok önemli, kritik' },
  { english: 'Ambiguous', turkish: 'Belirsiz, iki anlamlı' },
  { english: 'Persistent', turkish: 'Israrcı, kalıcı' },
  { english: 'Vulnerable', turkish: 'Savunmasız, incinebilir' },
  { english: 'Abundant', turkish: 'Bol, berekeli' },
  { english: 'Obsolete', turkish: 'Eski, modası geçmiş, kullanılmayan' },
  { english: 'Profound', turkish: 'Derin, şiddetli, köklü' },
  { english: 'Versatile', turkish: 'Çok yönlü, on parmağında on marifet olan' },
];

async function main() {
  console.log(`Start seeding ...`);
  
  // Ensure a default user exists for seeding
  let defaultUser = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (!defaultUser) {
    defaultUser = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash: 'seeded-password-hash', // Dummy hash for seed
      }
    });
    console.log(`Created Default User: ${defaultUser.username}`);
  }

  // First, create a Default Deck for this user
  let defaultDeck = await prisma.deck.findFirst({
    where: { 
      name: 'Genel Kelimeler',
      userId: defaultUser.id,
    }
  });

  if (!defaultDeck) {
    defaultDeck = await prisma.deck.create({
      data: { 
        name: 'Genel Kelimeler',
        userId: defaultUser.id,
      }
    });
    console.log(`Created Default Deck: ${defaultDeck.name}`);
  }

  // Then seed words and attach them to the default deck
  for (const word of initialVocabulary) {
    const existingWord = await prisma.word.findFirst({
      where: { english: word.english }
    });
    
    if (!existingWord) {
      const createdWord = await prisma.word.create({
        data: {
          ...word,
          deckId: defaultDeck.id
        },
      });
      console.log(`Created word with id: ${createdWord.id} in deck ${defaultDeck.name}`);
    } else {
      console.log(`Word ${word.english} already exists.`);
    }
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
