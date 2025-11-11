import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">সেটিংস</h1>
        <p className="text-muted-foreground">
          আপনার অ্যাকাউন্ট সেটিংস, নিরাপত্তা এবং ডেটা পছন্দ পরিচালনা করুন।
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>প্রোফাইল</CardTitle>
          <CardDescription>আপনার ব্যক্তিগত তথ্য আপডেট করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">পুরো নাম</Label>
              <Input id="name" defaultValue="জামাল উদ্দিন" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input id="email" type="email" defaultValue="manager@example.com" disabled />
            </div>
          </div>
          <Button>পরিবর্তন সংরক্ষণ করুন</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>নিরাপত্তা</CardTitle>
          <CardDescription>আপনার নিরাপত্তা সেটিংস পরিচালনা করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-medium">দুই-ফ্যাক্টর প্রমাণীকরণ</h3>
              <p className="text-sm text-muted-foreground">
                আপনার অ্যাকাউন্টে একটি অতিরিক্ত নিরাপত্তা স্তর যোগ করুন।
              </p>
            </div>
            <Switch aria-label="দুই-ফ্যাক্টর প্রমাণীকরণ টগল করুন" />
          </div>
           <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড পরিবর্তন করুন</Label>
              <Input id="password" type="password" placeholder="নতুন পাসওয়ার্ড" />
            </div>
          <Button>পাসওয়ার্ড আপডেট করুন</Button>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>ডেটা ও ব্যাকআপ</CardTitle>
          <CardDescription>অ্যাপ্লিকেশন ডেটা এবং ব্যাকআপ পরিচালনা করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-medium">স্বয়ংক্রিয় ক্লাউড ব্যাকআপ</h3>
              <p className="text-sm text-muted-foreground">
                গুগল ড্রাইভে স্বয়ংক্রিয় দৈনিক ব্যাকআপ সক্ষম করুন।
              </p>
            </div>
             <Switch defaultChecked aria-label="স্বয়ংক্রিয় ক্লাউড ব্যাকআপ টগল করুন" />
          </div>
          <Button variant="outline">ম্যানুয়াল ব্যাকআপ তৈরি করুন</Button>
        </CardContent>
      </Card>
    </div>
  )
}
