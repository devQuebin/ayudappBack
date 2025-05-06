import { serverTimestamp } from "firebase/firestore";

export const addCreatedTimestamps = {
  toFirestore: (docData) => {
    return {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...docData,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      createdAt:
        data.createdAt && data.createdAt.toDate
          ? data.createdAt.toDate().toISOString()
          : null,
      updatedAt:
        data.updatedAt && data.updatedAt.toDate
          ? data.updatedAt.toDate().toISOString()
          : null,
    };
  },
};
