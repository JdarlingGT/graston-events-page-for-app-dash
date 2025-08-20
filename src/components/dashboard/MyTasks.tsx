import React from 'react';

interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  status: 'open' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

interface MyTasksProps {
  tasks: Task[];
  showCompleted?: boolean;
  loading?: boolean;
  onClick?: (task: Task) => void;
}

const MyTasks: React.FC<MyTasksProps> = ({ tasks, showCompleted = false, loading, onClick }) => {
  if (loading) {
    return <MyTasksSkeleton />;
  }

  const filteredTasks = tasks
    .filter(task => showCompleted || task.status !== 'done')
    .sort((a, b) => {
      // Sort by status (open/in_progress first), then by priority
      const statusOrder = { open: 0, in_progress: 1, done: 2 };
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (date: string | null) => {
    if (!date) {
return 'No due date';
}
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
return `Overdue by ${Math.abs(diffDays)} days`;
}
    if (diffDays === 0) {
return 'Due today';
}
    if (diffDays === 1) {
return 'Due tomorrow';
}
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6" role="region" aria-label="My Tasks">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">My Tasks</h2>
      {filteredTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">You're all caught up!</p>
      ) : (
        <ul className="space-y-3" role="list" aria-live="polite">
          {filteredTasks.map(task => (
            <li 
              key={task.id} 
              className={`border rounded-lg p-3 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
              onClick={() => onClick?.(task)}
              tabIndex={onClick ? 0 : undefined}
              onKeyPress={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                  onClick(task);
                }
              }}
              role={onClick ? 'button' : undefined}
              aria-label={`Task: ${task.title}, Status: ${task.status}, Priority: ${task.priority}, ${formatDueDate(task.dueDate)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{formatDueDate(task.dueDate)}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <span 
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(task.status)}`}
                    role="status"
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                  <span 
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(task.priority)}`}
                    role="status"
                    aria-label={`Priority: ${task.priority}`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const MyTasksSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse" aria-hidden="true" aria-busy="true">
    <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="border rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-56 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex space-x-2 ml-4">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Object.assign(MyTasks, { Skeleton: MyTasksSkeleton });