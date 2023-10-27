import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // CONTRACTS
  {
    path: '',
    redirectTo: 'pitches',
    pathMatch: 'full',
  },
  {
    path: 'pitches',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },

  {
    path: 'pitches/:pitch_key',
    loadChildren: () =>
      import('./pages/egg-campaign/egg-campaign.module').then(
        (m) => m.EggCampaignPageModule
      ),
  },
  {
    path: 'pitches/:pitch_key/contribution',
    loadChildren: () =>
      import('./pages/choose-pledge-options/choose-pledge-options.module').then(
        (m) => m.ChoosePledgeOptionsPageModule
      ),
  },
  {
    path: 'pitches/:pitch_key/contribution/completed',
    loadChildren: () =>
      import(
        './pages/contribution-completed/contribution-completed.module'
      ).then((m) => m.ContributionCompletedPageModule),
  },
  {
    path: 'pitches/:pitch_key/contribution/choose-method',
    loadChildren: () =>
      import('./pages/choose-payment-method/choose-payment-method.module').then(
        (m) => m.ChoosePaymentMethodPageModule
      ),
  },
  {
    path: 'history/contributions',
    loadChildren: () =>
      import('./pages/contribution-history/contribution-history.module').then(
        (m) => m.ContributionHistoryPageModule
      ),
  },
  {
    path: 'history/contributions/:contribution_id',
    loadChildren: () =>
      import('./pages/contribution-details/contribution-details.module').then(
        (m) => m.ContributionDetailsPageModule
      ),
  },

  // NEW CONTRACT
  {
    path: 'pitches/create',
    redirectTo: 'pitches/create/basics',
  },
  {
    path: 'pitches/create/basics',
    loadChildren: () =>
      import('./pages/create/create.module').then((m) => m.CreatePageModule),
  },
  {
    path: 'pitches/create/story',
    loadChildren: () =>
      import('./pages/create-story/create-story.module').then(
        (m) => m.CreateStoryPageModule
      ),
  },
  {
    path: 'pitches/create/finances',
    loadChildren: () =>
      import('./pages/create-contributions/create-contributions.module').then(
        (m) => m.CreateContributionsPageModule
      ),
  },
  {
    path: 'pitches/create/milestones',
    loadChildren: () =>
      import('./pages/create-milestones/create-milestones.module').then(
        (m) => m.CreateMilestonesPageModule
      ),
  },
  {
    path: 'pitches/create/rewards',
    loadChildren: () =>
      import('./pages/create-rewards/create-rewards.module').then(
        (m) => m.CreateRewardsPageModule
      ),
  },
  {
    path: 'pitches/create/documentation',
    loadChildren: () =>
      import('./pages/create-documentation/create-documentation.module').then(
        (m) => m.CreateDocumentationPageModule
      ),
  },
  {
    path: 'pitches/create/curators',
    loadChildren: () =>
      import('./pages/create-curators/create-curators.module').then(
        (m) => m.CreateCuratorsPageModule
      ),
  },
  {
    path: 'pitches/create/review',
    loadChildren: () =>
      import('./pages/create-curators/create-curators.module').then(
        (m) => m.CreateCuratorsPageModule
      ),
  },

  {
    path: 'pitches/view-history',
    loadChildren: () =>
      import('./pages/view-history/view-history.module').then(
        (m) => m.ViewHistoryPageModule
      ),
  },

  // ACCOUNT MANAGEMENT
  {
    path: 'join',
    loadChildren: () =>
      import('./pages/signup/signup.module').then((m) => m.SignupPageModule),
  },
  {
    path: 'errors/:error_code',
    loadChildren: () =>
      import('./pages/not-found/not-found.module').then(
        (m) => m.NotFoundPageModule
      ),
  },
  {
    path: 'signin',
    loadChildren: () =>
      import('./pages/signin/signin.module').then((m) => m.SigninPageModule),
  },
  {
    path: 'hetcher/:username',
    loadChildren: () =>
      import('./pages/hetcher/hetcher.module').then((m) => m.HetcherPageModule),
  },
  {
    path: '2fa-auth/verifications/sent',
    loadChildren: () =>
      import('./pages/email-verification/email-verification.module').then(
        (m) => m.EmailVerificationPageModule
      ),
  },
  {
    path: '2fa-auth/verifications/token/:token',
    loadChildren: () =>
      import(
        './pages/two-fa-verification-code/two-fa-verification-code.module'
      ).then((m) => m.TwoFaVerificationCodePageModule),
  },

  // SETTINGS MANAGEMENT
  {
    path: 'settings',
    redirectTo: 'settings/security',
    pathMatch: 'full',
  },
  {
    path: 'settings/:settings_category',
    loadChildren: () =>
      import('./pages/settings/settings.module').then(
        (m) => m.SettingsPageModule
      ),
  },

  // CONTRACTS AND CURATOR DISCOVERY
  {
    path: 'search',
    loadChildren: () =>
      import('./pages/search/search.module').then((m) => m.SearchPageModule),
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./pages/categories/categories.module').then(
        (m) => m.CategoriesPageModule
      ),
  },
  {
    path: 'categories/:category_name',
    loadChildren: () =>
      import('./pages/selected-category/selected-category.module').then(
        (m) => m.SelectedCategoryPageModule
      ),
  },
  {
    path: 'choose-interests',
    loadChildren: () =>
      import('./pages/choose-interests/choose-interests.module').then(
        (m) => m.ChooseInterestsPageModule
      ),
  },

  // SUPPORT PORTAL
  {
    path: 'support',
    loadChildren: () =>
      import('./pages/support-portal/support-portal.module').then(
        (m) => m.SupportPortalPageModule
      ),
  },
  {
    path: 'support/article/:key',
    loadChildren: () =>
      import('./pages/support-article/support-article.module').then(
        (m) => m.SupportArticlePageModule
      ),
  },

  {
    path: 'embed/:contract_key',
    loadChildren: () =>
      import('./pages/embed/embed.module').then((m) => m.EmbedPageModule),
  },

  // NOT FOUND: ERROR FILTER
  {
    path: '**',
    redirectTo: 'errors/404',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
