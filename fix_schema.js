const fs = require('fs');
const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  notes     Note[]
}

model Note {
  id           String   @id @default(cuid())
  title        String
  content      String
  shortSummary String?
  bulletPoints String?
  keywords     String?
  language     String?  @default("tr")
  wordCount    Int?     @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
`;
fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Schema written OK, bytes:', Buffer.byteLength(schema, 'utf8'));
console.log('First 60 chars:', JSON.stringify(schema.slice(0, 60)));
