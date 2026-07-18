"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

export function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-normal sm:text-2xl">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage account preferences and application appearance.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base tracking-normal sm:text-lg">General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0 sm:p-6 sm:pt-0">
            <Label htmlFor="theme">Theme</Label>
            <Select
              id="theme"
              value={isMounted ? theme : "system"}
              onChange={(event) => setTheme(event.target.value)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base tracking-normal sm:text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 text-sm sm:p-6 sm:pt-0">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Name</p>
              <p className="mt-1 font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
              <p className="mt-1 break-all font-medium">{user?.email}</p>
            </div>
            <Badge variant="muted">{user?.role}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base tracking-normal sm:text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-sm text-muted-foreground">
              Profile details are managed from the Profile page and employee record workflows.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base tracking-normal sm:text-lg">About</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-sm text-muted-foreground">
              Employee Management System demo build with authentication, RBAC, employee CRUD,
              organization hierarchy, dashboard analytics, and deployment-ready configuration.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
