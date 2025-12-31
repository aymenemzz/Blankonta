import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- ROUTES CLIENTS ---

// 1. RÉCUPÉRER (GET)
app.get('/api/clients', async (_req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        authorizedEmails: true, // IMPORTANT : On demande à Prisma de ramener la table liée
      },
    });

    // On transforme les données pour que ton Front reçoive ce qu'il attend
    // (Le front veut un tableau de strings ["a@a.com"], pas des objets [{email: "a@a.com"}])
    const formatted = clients.map(c => ({
      ...c,
      authorizedEmails: c.authorizedEmails.map(e => e.email)
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du chargement" });
  }
});

// 2. CRÉER (POST)
app.post('/api/clients', async (req, res) => {
  const { companyName, siret, authorizedEmails, accountant, status } = req.body;
  // authorizedEmails est un tableau de strings : ["jean@test.com", "paul@test.com"]

  try {
    const result = await prisma.client.create({
      data: {
        companyName,
        siret,
        accountant,
        status,
        // C'est ici que la magie opère pour PostgreSQL :
        authorizedEmails: {
          connectOrCreate: authorizedEmails.map((email: string) => ({
            where: { email: email },
            create: { email: email },
          })),
        },
      },
      include: {
        authorizedEmails: true,
      }
    });

    // On renvoie le format attendu par le front
    const formatted = {
        ...result,
        authorizedEmails: result.authorizedEmails.map(e => e.email)
    };

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
});

// 3. MODIFIER (PUT)
app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { companyName, siret, authorizedEmails, accountant, status } = req.body;

  try {
    // Étape 1 : On déconnecte tous les anciens emails (reset)
    // C'est le moyen le plus simple de gérer une mise à jour de liste
    await prisma.client.update({
        where: { id },
        data: {
            authorizedEmails: { set: [] }
        }
    });

    // Étape 2 : On met à jour avec les nouveaux
    const result = await prisma.client.update({
      where: { id },
      data: {
        companyName,
        siret,
        accountant,
        status,
        authorizedEmails: {
          connectOrCreate: authorizedEmails.map((email: string) => ({
            where: { email: email },
            create: { email: email },
          })),
        },
      },
      include: { authorizedEmails: true }
    });

    const formatted = {
        ...result,
        authorizedEmails: result.authorizedEmails.map(e => e.email)
    };

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur PostgreSQL démarré sur http://localhost:${PORT}`);
});