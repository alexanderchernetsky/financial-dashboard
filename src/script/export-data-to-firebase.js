import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { initialData } from '../data';

// export all initial data to Firestore using batch writes (recommended for multiple documents)
async function addToFirestore() {
    try {
        console.log('Start adding data to Firestore...');
        const batch = writeBatch(db);

        initialData.forEach((entry, index) => {
            const docRef = doc(collection(db, 'portfolio'));
            batch.set(docRef, {
                ...entry,
                timestamp: serverTimestamp(),
            });
        });

        await batch.commit();
        console.log('Successfully added all portfolio entries to Firestore!');
    } catch (error) {
        console.error('Error adding to Firestore:', error);
    }
}

// Call the function you want to use
addToFirestore(); // Recommended for better performance with multiple documents
