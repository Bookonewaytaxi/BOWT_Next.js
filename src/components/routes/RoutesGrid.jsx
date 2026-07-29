import React from 'react';
import { motion } from 'framer-motion';
import RouteBox from './RouteBox';
import { Skeleton } from '@/components/ui/skeleton';

export default function RoutesGrid({ routes, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl bg-[#161B22]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load routes. Please try again later.</p>
      </div>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No routes found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {routes.map((route, index) => (
        <motion.div
          key={route.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <RouteBox route={route} />
        </motion.div>
      ))}
    </div>
  );
}