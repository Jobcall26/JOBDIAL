import { User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function UserAvatar({ 
  user, 
  className 
}: { 
  user?: Partial<User> | null; 
  className?: string 
}) {
  if (!user) {
    return (
      <Avatar className={cn("bg-neutral-200", className)}>
        <AvatarFallback className="text-neutral-500">
          ?
        </AvatarFallback>
      </Avatar>
    );
  }
  
  // Get initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get a consistent color based on username
  const getColorFromUsername = (username: string) => {
    const colors = [
      'bg-red-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    // Simple hash function to get consistent index
    const hash = username.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };
  
  const initials = getInitials(user.username || '?');
  const bgColor = getColorFromUsername(user.username || '?');
  
  return (
    <Avatar className={cn(bgColor, "text-white", className)}>
      <AvatarFallback>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
