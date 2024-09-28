import SwitchLeftRoundedIcon from "@mui/icons-material/SwitchLeftRounded";
import SwitchRightRoundedIcon from "@mui/icons-material/SwitchRightRounded";
import {
    OtherHousesOutlined,
    DashboardOutlined,
    BusinessRounded,
    MessageOutlined,
    InboxOutlined,
    PeopleOutlined,
    AddBoxOutlined,
    SettingsOutlined,
    ScienceOutlined,
    FolderOutlined,
    AddBox,
    Dashboard,
    Folder,
    Inbox,
    Message,
    OtherHouses,
    PeopleAlt,
    Science,
    Settings,
} from "@mui/icons-material";

const collapseIconLibrary = {
    Homepage: OtherHousesOutlined,
    Organization: BusinessRounded,
    Dashboard: DashboardOutlined,
    Members: PeopleOutlined,
    Programs: ScienceOutlined,
    Files: FolderOutlined,
    Messages: MessageOutlined,
    Settings: SettingsOutlined,
    Notification: InboxOutlined,
    NewOrganization: AddBoxOutlined,
    OpenedCollapseSidebar: SwitchLeftRoundedIcon,
    ClosedCollapseSidebar: SwitchRightRoundedIcon,
    // Selected path
    selectedHomepage: OtherHouses,
    selectedOrganization: BusinessRounded,
    selectedDashboard: Dashboard,
    selectedMembers: PeopleAlt,
    selectedPrograms: Science,
    selectedFiles: Folder,
    selectedMessages: Message,
    selectedSettings: Settings,
    selectedNotification: Inbox,
    selectedNewOrganization: AddBox,
};

export default collapseIconLibrary;
