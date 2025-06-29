import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const investmentsRef = collection(db, 'investments');

// Custom hook to fetch investments using Firestore's real-time updates
export const useInvestments = () => {
    return useQuery({
        queryKey: ['investments'],
        queryFn: () =>
            new Promise((resolve) => {
                const unsubscribe = onSnapshot(investmentsRef, (snapshot) => {
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        mutationFn: (newInvestment) => addDoc(investmentsRef, newInvestment),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['investments'] }),
    });
};

export const useRemoveInvestment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteDoc(doc(db, 'investments', String(id))),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['investments'] }),
    });
};
