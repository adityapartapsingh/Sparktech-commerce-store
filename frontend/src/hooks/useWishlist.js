import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  const toggleMutation = useMutation({
    mutationFn: (productId) => api.post(`/wishlist/toggle/${productId}`),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousWishlist = queryClient.getQueryData(['wishlist']);

      queryClient.setQueryData(['wishlist'], (old = []) => {
        const isWishlisted = old.some((item) => item._id === productId);
        if (isWishlisted) {
          return old.filter((item) => item._id !== productId);
        } else {
          // Optimistic addition (stubbing the object)
          return [...old, { _id: productId }];
        }
      });

      return { previousWishlist };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(['wishlist'], context.previousWishlist);
      toast.error('Failed to update wishlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onSuccess: (data) => {
       if(data?.data?.data?.action === 'added') {
          toast.success('Added to wishlist');
       } else {
          toast.success('Removed from wishlist');
       }
    }
  });

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  const toggleWishlist = (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      return;
    }
    toggleMutation.mutate(productId);
  };

  return {
    wishlist,
    isLoading,
    isInWishlist,
    toggleWishlist,
    isToggling: toggleMutation.isPending,
  };
};
