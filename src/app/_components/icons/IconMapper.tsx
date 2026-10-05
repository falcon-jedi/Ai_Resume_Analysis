import React, { forwardRef } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import PrintIcon from '@mui/icons-material/Print';
import LogoutIcon from '@mui/icons-material/Logout';
import DescriptionIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import VerifiedIcon from '@mui/icons-material/Verified';
import KeyIcon from '@mui/icons-material/Key';
import StyleIcon from '@mui/icons-material/Style';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import DrawIcon from '@mui/icons-material/Draw';
import RadarIcon from '@mui/icons-material/Radar';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CreateIcon from '@mui/icons-material/Create';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import BadgeIcon from '@mui/icons-material/Badge';
import TranslateIcon from '@mui/icons-material/Translate';
import ContactsIcon from '@mui/icons-material/Contacts';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ShieldIcon from '@mui/icons-material/Shield';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GoogleIcon from '@mui/icons-material/Google';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RefreshIcon from '@mui/icons-material/Refresh';
import TuneIcon from '@mui/icons-material/Tune';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import ShareIcon from '@mui/icons-material/Share';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import CodeIcon from '@mui/icons-material/Code';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import FeedbackIcon from '@mui/icons-material/Feedback';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import BugReportIcon from '@mui/icons-material/BugReport';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SendIcon from '@mui/icons-material/Send';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { TrashIcon } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  send: SendIcon,
  feedback: FeedbackIcon,
  rate_review: RateReviewIcon,
  star: StarIcon,
  star_border: StarBorderIcon,
  bug_report: BugReportIcon,
  lightbulb: LightbulbIcon,
  thumb_up: ThumbUpIcon,
  lock_reset: LockResetIcon,
  lock: LockIcon,
  lock_open: LockOpenIcon,
  keyboard_arrow_down: KeyboardArrowDownIcon,
  keyboard_arrow_up: KeyboardArrowUpIcon,
  dashboard: DashboardIcon,
  edit_note: EditNoteIcon,
  analytics: AnalyticsIcon,
  settings: SettingsIcon,
  menu_book: MenuBookIcon,
  upload: UploadFileIcon,
  upload_file: UploadFileIcon,
  folder_open: FolderOpenIcon,
  history: HistoryIcon,
  delete: DeleteIcon,
  menu: MenuIcon,
  clear_all: ClearAllIcon,
  search: SearchIcon,
  sparkles: AutoAwesomeIcon,
  auto_awesome: AutoAwesomeIcon,
  arrow_back: ArrowBackIcon,
  arrow_forward: ArrowForwardIcon,
  east: EastIcon,
  west: WestIcon,
  close: CloseIcon,
  download: DownloadIcon,
  check: CheckIcon,
  check_circle: CheckCircleIcon,
  cancel: CancelIcon,
  error: ErrorIcon,
  error_outline: ErrorOutlinedIcon,
  warning: WarningIcon,
  info: InfoIcon,
  link: LinkIcon,
  link_off: LinkOffIcon,
  print: PrintIcon,
  logout: LogoutIcon,
  description: DescriptionIcon,
  content_copy: ContentCopyIcon,
  edit: EditIcon,
  visibility: VisibilityIcon,
  visibility_off: VisibilityOffIcon,
  chevron_left: ChevronLeftIcon,
  chevron_right: ChevronRightIcon,
  first_page: FirstPageIcon,
  last_page: LastPageIcon,
  expand_more: ExpandMoreIcon,
  expand_less: ExpandLessIcon,
  add: AddIcon,
  remove: RemoveIcon,
  verified: VerifiedIcon,
  key: KeyIcon,
  style: StyleIcon,
  history_edu: HistoryEduIcon,
  model_training: ModelTrainingIcon,
  architecture: ArchitectureIcon,
  fact_check: FactCheckIcon,
  troubleshoot: TroubleshootIcon,
  receipt_long: ReceiptLongIcon,
  edit_document: EditDocumentIcon,
  draw: DrawIcon,
  radar: RadarIcon,
  psychology: PsychologyIcon,
  picture_as_pdf: PictureAsPdfIcon,
  ink_pen: CreateIcon,
  auto_stories: AutoStoriesIcon,
  auto_fix: AutoFixHighIcon,
  auto_fix_high: AutoFixHighIcon,
  bookmark: BookmarkIcon,
  task_alt: TaskAltIcon,
  workspace_premium: WorkspacePremiumIcon,
  progress_activity: HourglassEmptyIcon,
  hourglass_empty: HourglassEmptyIcon,
  person: PersonIcon,
  account_circle: AccountCircleIcon,
  work: WorkIcon,
  school: SchoolIcon,
  military_tech: MilitaryTechIcon,
  badge: BadgeIcon,
  translate: TranslateIcon,
  contacts: ContactsIcon,
  credit_card: CreditCardIcon,
  shield: ShieldIcon,
  notifications: NotificationsIcon,
  google: GoogleIcon,
  find_in_page: FindInPageIcon,
  drag_indicator: DragIndicatorIcon,
  refresh: RefreshIcon,
  tune: TuneIcon,
  filter_list: FilterListIcon,
  sort: SortIcon,
  file_copy: FileCopyIcon,
  format_quote: FormatQuoteIcon,
  help_outline: HelpOutlinedIcon,
  share: ShareIcon,
  mail: MailIcon,
  phone: PhoneIcon,
  location_on: LocationOnIcon,
  language: LanguageIcon,
  code: CodeIcon,
  radio_button_unchecked: RadioButtonUncheckedIcon,
  trash: TrashIcon,
};

export type IconName = string;

export interface IconMapperProps {
  name: IconName;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: 'inherit' | 'small' | 'medium' | 'large';
  onClick?: React.MouseEventHandler<any>;
}

export const IconMapper = forwardRef<any, IconMapperProps>(
  ({ name, className, style, fontSize = 'inherit', onClick }, ref) => {
    const normalizedKey = (name || '').trim().toLowerCase().replace(/-/g, '_');
    const IconComponent = iconMap[normalizedKey] || iconMap[name];

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in IconMapper.`);
      return null;
    }

    return (
      <IconComponent
        ref={ref}
        className={className}
        style={style}
        fontSize={fontSize}
        onClick={onClick}
        sx={{
          fontSize: 'inherit',
          color: 'inherit',
        }}
      />
    );
  },
);

IconMapper.displayName = 'IconMapper';

export default IconMapper;
