import { Db, ObjectId } from 'mongodb';
import { DatabaseManager } from './database.manager';

interface Criterion {
  _id: ObjectId;
  name: string;
  project: ObjectId;
  range: number;
}

interface Participant {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  preferences: ObjectId[];
  projectId: ObjectId;
  tz: string;
}

interface ParticipantCriterion {
  _id: ObjectId;
  criterion: ObjectId;
  participant: ObjectId;
  value: number;
}

export async function generateMockData(
  projectId: ObjectId,
  participantsCount: number,
  criteriaCount: number
): Promise<void> {
  const db: Db = DatabaseManager.getDb();

  const criteriaCollection = db.collection<Criterion>('Criteria');
  const criteriaDocs: Criterion[] = [];
  for (let i = 1; i <= criteriaCount; i++) {
    const critId = new ObjectId();
    criteriaDocs.push({
      _id: critId,
      name: `Criterion ${i}`,
      project: projectId,
      range: 10,
    });
  }
  await criteriaCollection.insertMany(criteriaDocs);
  const criteriaIds = criteriaDocs.map((doc) => doc._id);

  const maxFriendGroupSize = 3;
  const usedForGroups = new Set<number>();
  const participantToFriends = new Map<number, number[]>();

  for (let i = 1; i <= participantsCount; i++) {
    if (usedForGroups.has(i)) continue;
    if (Math.random() < 0.2 && i < participantsCount) {
      const remaining = participantsCount - i + 1;
      const groupSize = Math.min(
        maxFriendGroupSize,
        Math.floor(Math.random() * (maxFriendGroupSize - 1)) + 2,
        remaining
      );
      const group: number[] = [];
      for (let k = 0; k < groupSize; k++) {
        group.push(i + k);
        usedForGroups.add(i + k);
      }
      for (const idx of group) {
        participantToFriends.set(
          idx,
          group.filter((x) => x !== idx)
        );
      }
    }
  }

  const participantsCollection = db.collection<Participant>('Participants');
  const participantDocs: Participant[] = [];

  function idFromIndex(i: number): ObjectId {
    const hex = i.toString(16).padStart(24, '0');
    return new ObjectId(hex);
  }

  const maxPrefs = 4;

  for (let i = 1; i <= participantsCount; i++) {
    const partId = idFromIndex(i);
    const prefs: ObjectId[] = [];

    const friends = participantToFriends.get(i) || [];
    for (const friendIdx of friends) {
      if (prefs.length >= maxPrefs) break;
      prefs.push(idFromIndex(friendIdx));
    }

    const extrasCount = Math.floor(
      Math.random() * (maxPrefs - prefs.length + 1)
    );
    while (prefs.length < friends.length + extrasCount) {
      const candidateIdx = Math.floor(Math.random() * participantsCount) + 1;
      const candidateId = idFromIndex(candidateIdx);
      if (candidateIdx !== i && !prefs.includes(candidateId)) {
        prefs.push(candidateId);
      }
    }

    participantDocs.push({
      _id: partId,
      firstName: `Mock`,
      lastName: `User ${i}`,
      preferences: prefs,
      projectId: projectId,
      tz: i.toString().padStart(9, '0'),
    });
  }

  await participantsCollection.insertMany(participantDocs);
  const participantIds = participantDocs.map((doc) => doc._id);

  const partCritCollection = db.collection<ParticipantCriterion>(
    'Participants_Criteria'
  );
  const partCritDocs: ParticipantCriterion[] = [];

  for (const partId of participantIds) {
    for (const critId of criteriaIds) {
      partCritDocs.push({
        _id: new ObjectId(),
        criterion: critId,
        participant: partId,
        value: Math.floor(Math.random() * 10) + 1,
      });
    }
  }

  await partCritCollection.insertMany(partCritDocs);
}
