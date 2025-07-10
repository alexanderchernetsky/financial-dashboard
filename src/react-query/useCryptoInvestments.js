import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// the below is used for CryptoTracker

const investmentsRef = collection(db, 'crypto-investments');

// Custom hook to fetch investments using Firestore's real-time updates
export const useCryptoInvestments = () => {
    return useQuery({
        queryKey: ['crypto-investments'],
        queryFn: () =>
            new Promise(resolve => {
                const unsubscribe = onSnapshot(investmentsRef, snapshot => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    resolve(data);
                });

                // Return unsubscribe so React Query knows how to clean up
                return () => unsubscribe();
            }),
        staleTime: Infinity,
    });
};

export const useAddInvestment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: newInvestment => addDoc(investmentsRef, newInvestment),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crypto-investments'] }),
    });
};

export const useUpdateInvestment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => {
            const docRef = doc(db, 'crypto-investments', String(id));
            return updateDoc(docRef, updateData);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crypto-investments'] }),
    });
};

export const useRemoveInvestment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: id => deleteDoc(doc(db, 'crypto-investments', String(id))),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crypto-investments'] }),
    });
};
