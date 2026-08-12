import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui.jsx';

export default function TeamMembersPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  // Keep UX simple: members are managed inside TeamDetailsPage
  React.useEffect(() => {
    navigate(`/teams/${teamId}`);
  }, [navigate, teamId]);

  return <Card className="p-5">Redirecting...</Card>;
}

