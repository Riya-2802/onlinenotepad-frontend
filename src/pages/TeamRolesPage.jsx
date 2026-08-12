import React from 'react';
import { Card, SectionTitle } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';

export default function TeamRolesPage() {
  const { toast } = useToast();

  React.useEffect(() => {
    toast({
      type: 'info',
      message: 'Roles are managed inside Team Details → Roles tab.',
    });
  }, [toast]);

  return (
    <Card className="p-5">
      <SectionTitle title="Roles" subtitle="Use Team Details → Roles tab" />
      <div className="text-sm text-slate-600">
        This route is no longer used in the simplified 3-page team UI.
      </div>
    </Card>
  );
}

