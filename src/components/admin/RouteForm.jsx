import React from 'react';
import { useRouter } from 'next/router';
import CreateRouteForm from './routes/CreateRouteForm';
import EditRouteForm from './routes/EditRouteForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Wrapper component to maintain compatibility with existing imports.
 * Delegates to new simplified forms based on mode.
 */
export default function RouteForm({ initialData = null, isEditMode = false }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/admin/routes')}
          className="hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">
            {isEditMode ? 'Edit Route' : 'Create New Route'}
          </h1>
          <p className="text-slate-400 mt-1">
            {isEditMode ? 'Update route details and pricing.' : 'Add a new travel route to the system.'}
          </p>
        </div>
      </div>

      {isEditMode ? (
        <EditRouteForm routeId={initialData?.id} initialData={initialData} />
      ) : (
        <CreateRouteForm />
      )}
    </div>
  );
}