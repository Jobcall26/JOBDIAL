import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = "éléments"
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Current page and surrounding pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents another ellipsis (for uniqueness in React)
      }
      
      // Always include last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  // Calculate info text about current items being displayed
  const getInfoText = () => {
    if (!totalItems || !itemsPerPage) return "";
    
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    return `Affichage de ${start} à ${end} sur ${totalItems} ${itemName}`;
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
      <div className="text-neutral-dark mb-2 sm:mb-0">
        {getInfoText()}
      </div>
      
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-l-md"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {getPageNumbers().map((page, i) => (
          page < 0 ? (
            <Button
              key={`ellipsis-${i}`}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-l-0"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className={`h-8 w-8 p-0 ${i > 0 ? 'border-l-0' : ''} ${
                page === currentPage ? 'bg-primary text-white' : ''
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        ))}
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 border-l-0 rounded-r-md"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
