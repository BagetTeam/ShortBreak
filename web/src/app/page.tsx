import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="gap-3 border-b px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                ShortBreak
              </p>
              <h1 className="text-lg font-semibold text-foreground">
                Learning Feed
              </h1>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Sessions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {["Atomic Habits", "Roman History", "SwiftUI Basics"].map(
                  (title) => (
                    <SidebarMenuItem key={title}>
                      <SidebarMenuButton>{title}</SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {["New Prompt", "Import PDF", "Settings"].map((label) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton>{label}</SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t px-4 py-4">
          <Button className="w-full">Start a Session</Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full min-h-svh flex-col bg-[radial-gradient(circle_at_top,_#f7f2ff,_#fff_45%,_#f7f9ff_100%)]">
          <header className="flex items-center justify-between border-b border-border/60 px-6 py-5">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Curriculum
              </p>
              <h2 className="text-2xl font-semibold text-foreground">
                Design Your Next Learning Sprint
              </h2>
            </div>
            <Button variant="outline">View Queue</Button>
          </header>
          <main className="flex flex-1 flex-col gap-6 px-6 py-6">
            <section className="rounded-3xl border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur">
              <h3 className="text-lg font-semibold text-foreground">
                Prompt to Feed
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Translate a goal into a binge-proof curriculum. Upload a PDF
                syllabus or describe what you want to master, and we will
                assemble a short-form playlist tuned to your intent.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Build a 7-day calculus crash course",
                  "Teach me modern typography basics",
                  "Learn iOS animations in 10 clips",
                ].map((prompt) => (
                  <span
                    key={prompt}
                    className="rounded-full border border-border/70 bg-white px-4 py-2 text-xs font-medium text-foreground"
                  >
                    {prompt}
                  </span>
                ))}
              </div>
            </section>
            <section className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border/70 bg-white/50 p-10 text-center text-sm text-muted-foreground">
              The feed and chat stream will appear here once you submit a prompt.
            </section>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
