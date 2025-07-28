import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit2, GripVertical } from 'lucide-react';
import { Task, useBoardStore } from '@/store/boardStore';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const { updateTask, deleteTask } = useBoardStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    updateTask(task.id, { title, description });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setIsEditing(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-md bg-card border-border',
        isDragging && 'opacity-50 rotate-3 scale-105 shadow-lg'
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-hover-bg rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="flex-1 min-w-0">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <h4 className="font-medium text-card-foreground text-sm mb-1 break-words">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-muted-foreground break-words line-clamp-3">
                      {task.description}
                    </p>
                  )}
                </div>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Task title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Task description"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}