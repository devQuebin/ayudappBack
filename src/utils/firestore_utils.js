// utils/firestore_utils.js
import { 
  serverTimestamp,
  doc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";
import { db } from "../config/firebase_config.js";

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

export const updateCampaignDonationStats = async (campaignId, amount, isNewDonor) => {
  const campaignRef = doc(db, "campaign", campaignId);
  const campaignSnap = await getDoc(campaignRef);

  if (!campaignSnap.exists()) {
    throw new Error("Campaign not found");
  }

  const campaignData = campaignSnap.data();
  const updates = {
    totalRaised: (campaignData.totalRaised || 0) + amount,
  };

  if (isNewDonor) {
    updates.donorCount = (campaignData.donorCount || 0) + 1;
  }

  await updateDoc(campaignRef, updates);
};