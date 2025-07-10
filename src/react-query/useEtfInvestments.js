import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const investmentsRef = collection(db, 'etf-investments'); // <-- Changed collection name

export const useEtfInvestments = () => {
    return useQuery({
        queryKey: ['etf-investments'],
        queryFn: () =>
            new Promise(resolve => {
                const unsubscribe = onSnapshot(investmentsRef, snapshot => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    resolve(data);
                });
                return () => unsubscribe();
            }),
        staleTime: Infinity,
    });
};

export const useAddEtfInvestment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: newInvestment => addDoc(investmentsRef, newInvestment),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etf-investments'] }),
    });
};

export const useUpdateEtfInvestment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => {
            const docRef = doc(db, 'etf-investments', String(id));
            return updateDoc(docRef, updateData);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etf-investments'] }),
    });
};

export const useRemoveEtfInvestment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: id => deleteDoc(doc(db, 'etf-investments', String(id))),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etf-investments'] }),
    });
};
