import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// fetches portfolio summary data
export const useInvestmentsPolling = () => {
    const investmentsRef = collection(db, 'portfolio');

    return useQuery({
        queryKey: ['portfolio'],
        queryFn: async () => {
            const snapshot = await getDocs(investmentsRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        },
        refetchInterval: 600000, // Poll every 10 minutes
        staleTime: 300000,       // Consider data stale after 5 minutes
    });
};
