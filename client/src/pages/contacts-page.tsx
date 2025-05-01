import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
  Calendar,
  Download,
  Filter,
  Phone,
  Mail,
  Plus,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  company: string | null;
  status: string;
  campaignId: number;
  campaignName: string;
  lastCallDate: string | null;
  lastCallResult: string | null;
  notes: string;
};

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");

  // Fetch contacts with pagination and filters
  const { data, isLoading } = useQuery<{
    contacts: Contact[];
    total: number;
    limit: number;
  }>({
    queryKey: [
      "/api/contacts", 
      { 
        page, 
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        campaignId: campaignFilter !== "all" ? parseInt(campaignFilter) : undefined,
      }
    ],
  });

  // Fetch campaigns for filters
  const { data: filterOptions } = useQuery<{
    statuses: { value: string; label: string }[];
    campaigns: { value: string; label: string }[];
  }>({
    queryKey: ["/api/contacts/filter-options"],
  });

  const contacts = data?.contacts || [];
  const totalContacts = data?.total || 0;
  const pageSize = data?.limit || 10;
  const totalPages = Math.ceil(totalContacts / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleApplyFilters = () => {
    setPage(1);
    setIsFiltersOpen(false);
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setCampaignFilter("all");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-amber-500 text-amber-600">En attente</Badge>;
      case "contacted":
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Contacté</Badge>;
      case "callback":
        return <Badge variant="outline" className="border-green-500 text-green-600">Rappel</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-emerald-500 text-emerald-600">Terminé</Badge>;
      case "do_not_call":
        return <Badge variant="outline" className="border-red-500 text-red-600">Ne pas appeler</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Contacts"
        description="Gestion des contacts et des leads"
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold">Liste des contacts</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFiltersOpen(true)}>
                <Filter className="h-4 w-4 mr-1" />
                Filtrer
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </Button>
              <form onSubmit={handleSearch} className="flex">
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 h-9"
                />
                <Button type="submit" variant="ghost" className="ml-2 h-9">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-neutral-light">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Campagne
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    Dernier appel
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {!isLoading && contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-neutral-lightest">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1 text-neutral-dark" />
                            <span>{contact.phone}</span>
                          </div>
                          {contact.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-neutral-dark" />
                              <span>{contact.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div>{contact.company || "-"}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div>{contact.campaignName}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {getStatusBadge(contact.status)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {contact.lastCallDate ? (
                          <div>
                            <div>{contact.lastCallDate}</div>
                            <div className="text-xs text-neutral-dark">
                              {contact.lastCallResult === "interested" && "Intéressé"}
                              {contact.lastCallResult === "refused" && "Refusé"}
                              {contact.lastCallResult === "callback" && "Rappel"}
                              {contact.lastCallResult === "absent" && "Absent"}
                              {!contact.lastCallResult && "-"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-neutral-dark">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Voir détails</DropdownMenuItem>
                            <DropdownMenuItem>Appeler</DropdownMenuItem>
                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-neutral-dark">
                      {isLoading ? "Chargement des contacts..." : "Aucun contact trouvé"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalContacts}
              itemsPerPage={pageSize}
              itemName="contacts"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters Dialog */}
      <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrer les contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {filterOptions?.statuses?.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Campagne</label>
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les campagnes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les campagnes</SelectItem>
                  {filterOptions?.campaigns?.map((campaign) => (
                    <SelectItem key={campaign.value} value={campaign.value}>
                      {campaign.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleResetFilters}>
                Réinitialiser
              </Button>
              <Button onClick={handleApplyFilters}>
                Appliquer les filtres
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
