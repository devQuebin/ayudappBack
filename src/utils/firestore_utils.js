import { serverTimestamp } from 'firebase/firestore';

function formatMesAnio(timestamp) {
    if (!timestamp || !timestamp.toDate) return null;
    const date = timestamp.toDate();
    const mes = date.toLocaleString('es-ES', { month: 'long' });
    const año = date.getFullYear();
    return `${mes} ${año}`;
}

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
            created_at: formatMesAnio(data.created_at),
            updated_at: formatMesAnio(data.updated_at),
        }
    },
}

