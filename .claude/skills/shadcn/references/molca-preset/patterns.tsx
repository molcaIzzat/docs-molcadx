// Molca shadcn preset — button patterns
// Source: Figma "Molca — Shadcn Design System" (file mvVIgPwuzefi1XA90TstQ6),
// "Button - Component" frame 11762:857, read via the Figma plugin bridge.
// Compositions of the preset Button + stock shadcn primitives. Sizes/labels verified:
// all rows are 36px tall (size="sm"); split/input radius 8px, menu radius 12px.
//
// Adjust the @/components/ui/* import paths to the project's aliases.

import * as React from "react"
import { ChevronDownIcon, SearchIcon, SendIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/* Button Group — Figma 13018:70074. Horizontal, 8px gap, sm. */
export function ButtonGroup() {
  return (
    <div className="inline-flex items-center gap-2">
      <Button variant="secondary" size="sm">Archive</Button>
      <Button variant="secondary" size="sm">Report</Button>
      <Button variant="secondary" size="sm">Snooze</Button>
    </div>
  )
}

/* Button Orientation — Figma 13018:70075. Vertical stack. */
export function ButtonGroupVertical() {
  return (
    <div className="inline-flex flex-col gap-2">
      <Button variant="secondary" size="sm">Archive</Button>
      <Button variant="secondary" size="sm">Report</Button>
      <Button variant="secondary" size="sm">Snooze</Button>
    </div>
  )
}

/* Button Split — Figma 13018:70078. Primary action + chevron menu, shared 8px radius. */
export function ButtonSplit() {
  return (
    <div className="inline-flex items-center">
      <Button size="sm" className="rounded-r-none">Button</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" aria-label="More options" className="rounded-l-none border-l border-l-primary-foreground/20 px-2">
            <ChevronDownIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Action</DropdownMenuItem>
          <DropdownMenuItem>Another action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/* Input Search — Figma 13018:70079. Input + leading search icon, 8px radius. */
export function InputSearch() {
  return (
    <div className="relative w-[231px]">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" placeholder="Search..." className="h-9 rounded-lg pl-9" />
    </div>
  )
}

/* Input Group — Figma 13018:70080. Input + trailing send button, 8px gap. */
export function InputGroupSend() {
  return (
    <form className="inline-flex w-[270px] items-center gap-2">
      <Input placeholder="Send a message..." className="h-9 rounded-lg" />
      <Button type="submit" size="icon-sm" aria-label="Send">
        <SendIcon className="size-4" />
      </Button>
    </form>
  )
}

/* Dropdown Menu — Figma 13018:69843. "Follow" trigger + menu; Delete is destructive. */
export function DropdownMenuExample() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Follow
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44 rounded-xl">
        <DropdownMenuGroup>
          <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
          <DropdownMenuItem>Mark as Read</DropdownMenuItem>
          <DropdownMenuItem>Report Conversation</DropdownMenuItem>
          <DropdownMenuItem>Block User</DropdownMenuItem>
          <DropdownMenuItem>Share Conversation</DropdownMenuItem>
          <DropdownMenuItem>Copy Conversation</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete Conversation</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* Button Group (sizes) — Figma 13018:69733. Segmented (joined) buttons.
   Sizes small/default/large → xs/sm/md (heights 32/36/40). */
export function ButtonGroupSegmented({ size = "sm" }: { size?: "xs" | "sm" | "md" }) {
  return (
    <div className="inline-flex items-center">
      <Button variant="secondary" size={size} className="rounded-r-none">Button</Button>
      <Button variant="secondary" size={size} className="-ml-px rounded-l-none">Group</Button>
    </div>
  )
}

/* Currency input — Figma "Dropdown Select" 13018:69893. Amount + currency Select. */
export function CurrencyInput() {
  return (
    <div className="inline-flex w-[297px] items-center">
      <span className="flex h-9 items-center rounded-l-lg border border-r-0 border-input px-3 text-sm text-muted-foreground">$</span>
      <Input defaultValue="10.00" inputMode="decimal" className="h-9 rounded-none border-x-0 text-right" />
      <Select defaultValue="usd">
        <SelectTrigger className="h-9 w-[120px] rounded-l-none" aria-label="Currency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="usd">US Dollar</SelectItem>
          <SelectItem value="eur">Euro</SelectItem>
          <SelectItem value="gbp">British Pound</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

/* Agent-task popover — Figma "Dropdown Popover" 13018:69937. "Copilot" → task form. */
export function AgentTaskPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Copilot
          <ChevronDownIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 rounded-xl">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">Start a new task with Copilot</p>
          <p className="text-xs text-muted-foreground">
            Describe your task in natural language. Copilot will work in the background
            and open a pull request for your review.
          </p>
          <Textarea placeholder="Describe your task in natural language." className="min-h-20" />
          <Button size="sm" className="self-end">Start task</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
