import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { List, useBoardStore } from '@/store/boardStore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskListProps {
  list: List;
}

export function TaskList({ list }: TaskListProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [listTitle, setListTitle] = useState(list.title);
  const { addTask, updateListTitle, deleteList } = useBoardStore();

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  });

  const taskIds = list.tasks.map((task) => task.id);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(list.id, newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const handleUpdateTitle = () => {
    if (listTitle.trim() && listTitle !== list.title) {
      updateListTitle(list.id, listTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setListTitle(list.title);
    setIsEditingTitle(false);
  };

  const handleDeleteList = () => {
    deleteList(list.id);
  };

  return (
    <Card 
      className={cn(
        'w-80 bg-list-bg border-list-border transition-all duration-200 animate-fade-in',
        isOver && 'ring-2 ring-primary/50 bg-hover-bg'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateTitle();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="h-8 text-sm font-semibold"
                autoFocus
              />
            </div>
          ) : (
            <h3 
              className="font-semibold text-card-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {list.title}
            </h3>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit title
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDeleteList}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {list.tasks.length} {list.tasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </CardHeader>

      <CardContent className="space-y-3" ref={setNodeRef}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {list.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {isAddingTask ? (
          <div className="space-y-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }
              }}
              autoFocus
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                Add
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-hover-bg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add a task
          </Button>
        )}
      </CardContent>
    </Card>
  );
}