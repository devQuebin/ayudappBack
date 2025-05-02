import { serverTimestamp } from 'firebase/firestore';

export const addCreatedTimestamps = {
    toFirestore: (docData) => {
        return {
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            ...docData,
        }
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options)
        return {
            id: snapshot.id,
            ...data,
            created_at: data.created_at && data.created_at.toDate
                ? data.created_at.toDate().toISOString()
                : null,
            updated_at: data.updated_at && data.updated_at.toDate
                ? data.updated_at.toDate().toISOString()
                : null,
        }
    },
}

