# Azure Static Website
This is an example Azure Static Website that is designed to illustrate a deployment approval process using GitHub Actions and Microsoft Teams.

How this works is discussed in the following blog post in extensive detail:

* Approving Builds and Workflows with GitHub Actions and Microsoft Teams

You may also want to take a look at the associated projects:

* **[github-actions-approval-api](https://github.com/jamesridgway/github-actions-approval-api)**

  An Azure Function and Table Storage based API for requesting manual deployment approvals via Microsoft Teams
  
* **[github-actions-approval-request](https://github.com/jamesridgway/github-actions-approval-request)**

  A GitHub Action that you can include in your deployments to trigger the API to request a manual deployment approval via Microsoft Teams
