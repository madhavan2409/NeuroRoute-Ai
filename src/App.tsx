import React, { useState } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { ModelRoutingPage } from './pages/ModelRoutingPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { AiAgentsPage } from './pages/AiAgentsPage';
import { ModelRegistryPage } from './pages/ModelRegistryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CostOptimizationPage } from './pages/CostOptimizationPage';
import { QualityEvaluationPage } from './pages/QualityEvaluationPage';
import { SecurityCenterPage } from './pages/SecurityCenterPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewPage onNavigateToPlayground={() => setCurrentTab('playground')} />;
      case 'playground':
        return <PlaygroundPage />;
      case 'routing':
        return <ModelRoutingPage />;
      case 'workflows':
        return <WorkflowsPage />;
      case 'agents':
        return <AiAgentsPage />;
      case 'registry':
        return <ModelRegistryPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'cost-optimization':
        return <CostOptimizationPage />;
      case 'quality':
        return <QualityEvaluationPage />;
      case 'security':
        return <SecurityCenterPage />;
      case 'approvals':
        return <ApprovalsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage onNavigateToPlayground={() => setCurrentTab('playground')} />;
    }
  };

  return (
    <DashboardLayout currentTab={currentTab} onSelectTab={setCurrentTab}>
      {renderContent()}
    </DashboardLayout>
  );
}

export default App;
