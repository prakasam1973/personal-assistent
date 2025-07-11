import React, { useState } from 'react';
import { DailyEvent, SlackConfig } from '@/types/daily';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Send, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SlackIntegrationProps {
  events: DailyEvent[];
  onClose: () => void;
}

export const SlackIntegration: React.FC<SlackIntegrationProps> = ({ events, onClose }) => {
  const [slackConfig, setSlackConfig] = useState<SlackConfig>({
    webhookUrl: '',
    channel: '#daily',
    username: 'Daily Bot',
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slackConfig.webhookUrl.trim()) {
      setIsConfigured(true);
      toast({
        title: "Slack Configured",
        description: "Slack integration is now ready to use.",
      });
    }
  };

  const generateItineraryMessage = () => {
    let message = `📅 *Daily Schedule* 📅\n\n`;
    
    const eventsByDate = events.reduce((acc, event) => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, DailyEvent[]>);

    Object.entries(eventsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, dayEvents]) => {
        message += `📅 *${format(new Date(date), 'EEEE, MMMM dd')}*\n`;
        dayEvents
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .forEach(event => {
            message += `📌 ${event.startTime}-${event.endTime}: *${event.title}*\n`;
            if (event.person) {
              message += `   👤 ${event.person}\n`;
            }
            message += `   📍 ${event.location}\n`;
            if (event.description) {
              message += `   💭 ${event.description}\n`;
            }
            message += '\n';
          });
        message += '\n';
      });

    return message;
  };

  const sendToSlack = async () => {
    if (!isConfigured || !slackConfig.webhookUrl) {
      toast({
        title: "Configuration Required",
        description: "Please configure your Slack webhook URL first.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      const message = generateItineraryMessage();
      
      const response = await fetch(slackConfig.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          channel: slackConfig.channel,
          username: slackConfig.username,
          icon_emoji: ':calendar:',
        }),
      });

      if (response.ok) {
        toast({
          title: "Sent to Slack!",
          description: `Your schedule has been shared to ${slackConfig.channel}.`,
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending to Slack:', error);
      toast({
        title: "Send Failed",
        description: "Could not send message to Slack. Please check your webhook URL.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Slack Integration</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {!isConfigured ? (
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Setup Instructions</h3>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Go to your Slack workspace</li>
                  <li>2. Create a new Incoming Webhook</li>
                  <li>3. Copy the webhook URL and paste it below</li>
                </ol>
              </div>

              <div>
                <Label htmlFor="webhookUrl">Slack Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={slackConfig.webhookUrl}
                  onChange={(e) => setSlackConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://hooks.slack.com/services/..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="channel">Channel</Label>
                <Input
                  id="channel"
                  value={slackConfig.channel}
                  onChange={(e) => setSlackConfig(prev => ({ ...prev, channel: e.target.value }))}
                  placeholder="#daily"
                />
              </div>

              <div>
                <Label htmlFor="username">Bot Username</Label>
                <Input
                  id="username"
                  value={slackConfig.username}
                  onChange={(e) => setSlackConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Daily Bot"
                />
              </div>

              <Button type="submit" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configure Slack
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">✅ Slack Configured</h3>
                <p className="text-sm text-green-700">
                  Ready to send to {slackConfig.channel} as {slackConfig.username}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfigured(false)}
                  className="mt-2 text-green-700 hover:text-green-800"
                >
                  Reconfigure
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                <h4 className="font-medium text-gray-800 mb-2">Preview Message</h4>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {generateItineraryMessage()}
                </pre>
              </div>

              <Button
                onClick={sendToSlack}
                disabled={isSending || events.length === 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : 'Send Schedule to Slack'}
              </Button>

              {events.length === 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Add some events to your calendar first!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
