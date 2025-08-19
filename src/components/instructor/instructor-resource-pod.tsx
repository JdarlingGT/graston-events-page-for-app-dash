'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  Video, 
  Image, 
  Link as LinkIcon, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'image' | 'link';
  url: string;
  size?: string;
  duration?: string;
  description?: string;
  category: 'essential' | 'reference' | 'bonus';
  downloadable: boolean;
  cached?: boolean;
  lastAccessed?: string;
}

interface CacheStatus {
  totalSize: string;
  cachedItems: number;
  totalItems: number;
  lastSync: string;
}

const MOCK_RESOURCES: Resource[] = [
  {
    id: 'res_001',
    title: 'Essential Skills Checklist',
    type: 'document',
    url: '/resources/essential-skills-checklist.pdf',
    size: '2.3 MB',
    description: 'Complete checklist for evaluating student skills',
    category: 'essential',
    downloadable: true,
    cached: true,
  },
  {
    id: 'res_002',
    title: 'Technique Demonstration Video',
    type: 'video',
    url: '/resources/technique-demo.mp4',
    size: '45.2 MB',
    duration: '12:34',
    description: 'Step-by-step technique demonstration',
    category: 'essential',
    downloadable: true,
    cached: false,
  },
  {
    id: 'res_003',
    title: 'Anatomy Reference Chart',
    type: 'image',
    url: '/resources/anatomy-chart.jpg',
    size: '8.1 MB',
    description: 'High-resolution anatomy reference',
    category: 'reference',
    downloadable: true,
    cached: true,
  },
  {
    id: 'res_004',
    title: 'Online Assessment Portal',
    type: 'link',
    url: 'https://assessment.company.com',
    description: 'Student assessment and certification portal',
    category: 'essential',
    downloadable: false,
  },
  {
    id: 'res_005',
    title: 'Advanced Techniques Guide',
    type: 'document',
    url: '/resources/advanced-guide.pdf',
    size: '5.7 MB',
    description: 'Advanced techniques for experienced practitioners',
    category: 'bonus',
    downloadable: true,
    cached: false,
  },
  {
    id: 'res_006',
    title: 'Safety Protocols Video',
    type: 'video',
    url: '/resources/safety-protocols.mp4',
    size: '23.8 MB',
    duration: '8:15',
    description: 'Important safety guidelines and protocols',
    category: 'essential',
    downloadable: true,
    cached: true,
  },
];

export function InstructorResourcePod() {
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    totalSize: '59.1 MB',
    cachedItems: 3,
    totalItems: 6,
    lastSync: new Date().toISOString(),
  });

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const downloadResource = async (resource: Resource) => {
    if (!resource.downloadable) {
      toast.error('This resource is not downloadable');
      return;
    }

    try {
      // Simulate download
      toast.success(`Downloading ${resource.title}...`);
      
      // In a real implementation, this would:
      // 1. Download the file
      // 2. Store it in IndexedDB or Cache API
      // 3. Update the cached status
      
      setTimeout(() => {
        setResources(prev => prev.map(r => 
          r.id === resource.id ? { ...r, cached: true, lastAccessed: new Date().toISOString() } : r
        ));
        setCacheStatus(prev => ({
          ...prev,
          cachedItems: prev.cachedItems + 1,
          lastSync: new Date().toISOString(),
        }));
        toast.success(`${resource.title} cached for offline use`);
      }, 2000);
    } catch (error) {
      toast.error('Failed to download resource');
    }
  };

  const syncResources = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setCacheStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
      }));
      
      toast.success('Resources synced successfully');
    } catch (error) {
      toast.error('Failed to sync resources');
    } finally {
      setIsSyncing(false);
    }
  };

  const openResource = (resource: Resource) => {
    if (resource.type === 'link') {
      window.open(resource.url, '_blank');
    } else {
      // In a real implementation, this would open cached version if offline
      if (!isOnline && !resource.cached) {
        toast.error('Resource not available offline. Please download first.');
        return;
      }
      
      // Update last accessed
      setResources(prev => prev.map(r => 
        r.id === resource.id ? { ...r, lastAccessed: new Date().toISOString() } : r
      ));
      
      // Open resource (simulate)
      toast.info(`Opening ${resource.title}`);
    }
  };

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'document': return FileText;
      case 'video': return Video;
      case 'image': return Image;
      case 'link': return LinkIcon;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: Resource['category']) => {
    switch (category) {
      case 'essential': return 'destructive';
      case 'reference': return 'secondary';
      case 'bonus': return 'outline';
      default: return 'outline';
    }
  };

  const formatLastAccessed = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const essentialResources = resources.filter(r => r.category === 'essential');
  const referenceResources = resources.filter(r => r.category === 'reference');
  const bonusResources = resources.filter(r => r.category === 'bonus');

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Resource Pod
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={syncResources}
            disabled={!isOnline || isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
        
        {/* Cache Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Offline Cache</span>
            <span>{cacheStatus.cachedItems}/{cacheStatus.totalItems} items</span>
          </div>
          <Progress value={(cacheStatus.cachedItems / cacheStatus.totalItems) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {cacheStatus.totalSize} • Last sync: {formatLastAccessed(cacheStatus.lastSync)}
          </p>
        </div>

        {!isOnline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're offline. Only cached resources are available.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="essential" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="essential" className="text-xs">
              Essential ({essentialResources.length})
            </TabsTrigger>
            <TabsTrigger value="reference" className="text-xs">
              Reference ({referenceResources.length})
            </TabsTrigger>
            <TabsTrigger value="bonus" className="text-xs">
              Bonus ({bonusResources.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="essential" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {essentialResources.map((resource) => {
                  const Icon = getResourceIcon(resource.type);
                  return (
                    <div
                      key={resource.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                          {resource.cached && (
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {resource.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {resource.size && <span>{resource.size}</span>}
                            {resource.duration && <span>{resource.duration}</span>}
                            {resource.lastAccessed && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatLastAccessed(resource.lastAccessed)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openResource(resource)}
                              className="h-6 px-2 text-xs"
                            >
                              Open
                            </Button>
                            {resource.downloadable && !resource.cached && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadResource(resource)}
                                className="h-6 px-2 text-xs"
                                disabled={!isOnline}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reference" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {referenceResources.map((resource) => {
                  const Icon = getResourceIcon(resource.type);
                  return (
                    <div
                      key={resource.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                          {resource.cached && (
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {resource.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {resource.size && <span>{resource.size}</span>}
                            {resource.duration && <span>{resource.duration}</span>}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openResource(resource)}
                              className="h-6 px-2 text-xs"
                            >
                              Open
                            </Button>
                            {resource.downloadable && !resource.cached && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadResource(resource)}
                                className="h-6 px-2 text-xs"
                                disabled={!isOnline}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="bonus" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {bonusResources.map((resource) => {
                  const Icon = getResourceIcon(resource.type);
                  return (
                    <div
                      key={resource.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                          {resource.cached && (
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {resource.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {resource.size && <span>{resource.size}</span>}
                            {resource.duration && <span>{resource.duration}</span>}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openResource(resource)}
                              className="h-6 px-2 text-xs"
                            >
                              Open
                            </Button>
                            {resource.downloadable && !resource.cached && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadResource(resource)}
                                className="h-6 px-2 text-xs"
                                disabled={!isOnline}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}