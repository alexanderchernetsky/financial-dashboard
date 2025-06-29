import {useQuery} from "@tanstack/react-query";
import {collection, getDocs} from 'firebase/firestore';
import {db} from "../firebase";

export const useInvestmentsPolling = () => {
    const investmentsRef = collection(db, 'all-investments');

    return useQuery({
        queryKey: ['investments'],
        queryFn: async () => {
            const snapshot = await getDocs(investmentsRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        },
        refetchInterval: 30000, // Poll every 30 seconds
        staleTime: 25000, // Consider data stale after 25 seconds
    });
};
